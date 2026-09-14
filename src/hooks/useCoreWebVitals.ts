/**
 * useCoreWebVitals Hook
 *
 * Custom React hook for monitoring Core Web Vitals metrics (LCP, FID, CLS, etc.)
 * using the web-vitals library. Provides real-time performance monitoring and
 * automatic reporting to the performance context.
 *
 * @example
 * ```tsx
 * function WebVitalsMonitor() {
 *   const { lcp, fid, cls, overallScore } = useCoreWebVitals({
 *     enableRealtime: true,
 *   });
 *
 *   return (
 *     <div>
 *       <p>LCP: {lcp?.value}ms ({lcp?.rating})</p>
 *       <p>Overall Score: {overallScore}</p>
 *     </div>
 *   );
 * }
 * ```
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { onCLS, onLCP, onFCP, onTTFB, onINP } from "web-vitals";
import type { WebVitalMetric, WebVitalsData } from "../types/performance";
import { usePerformanceActions } from "../contexts";
import { getWebVitalRating, calculateWebVitalsScore } from "../utils";

// =============================================================================
// TYPES
// =============================================================================

// Generic metric type from web-vitals
interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType?: string;
}

interface UseCoreWebVitalsOptions {
  /** Enable real-time monitoring */
  enableRealtime?: boolean;
  /** Report interval in milliseconds */
  reportInterval?: number;
  /** Callback when metrics update */
  onMetricUpdate?: (metric: WebVitalMetric) => void;
}

interface UseCoreWebVitalsReturn {
  /** Largest Contentful Paint */
  lcp: WebVitalMetric | null;
  /** First Input Delay (deprecated, use INP) */
  fid: WebVitalMetric | null;
  /** Cumulative Layout Shift */
  cls: WebVitalMetric | null;
  /** First Contentful Paint */
  fcp: WebVitalMetric | null;
  /** Time to First Byte */
  ttfb: WebVitalMetric | null;
  /** Interaction to Next Paint */
  inp: WebVitalMetric | null;
  /** Overall performance score (0-100) */
  overallScore: number;
  /** All vitals data */
  vitalsData: WebVitalsData | null;
  /** Whether monitoring is active */
  isMonitoring: boolean;
  /** Start monitoring */
  startMonitoring: () => void;
  /** Stop monitoring */
  stopMonitoring: () => void;
  /** Reset metrics */
  resetMetrics: () => void;
}

// =============================================================================
// HOOK
// =============================================================================

export function useCoreWebVitals({
  enableRealtime = false,
  reportInterval = 5000,
  onMetricUpdate,
}: UseCoreWebVitalsOptions = {}): UseCoreWebVitalsReturn {
  // Actions only, so reporting a vital does not re-render the reporter.
  const { updateWebVitals } = usePerformanceActions();

  const [lcp, setLcp] = useState<WebVitalMetric | null>(null);
  const [fid] = useState<WebVitalMetric | null>(null); // FID is deprecated, kept for compatibility
  const [cls, setCls] = useState<WebVitalMetric | null>(null);
  const [fcp, setFcp] = useState<WebVitalMetric | null>(null);
  const [ttfb, setTtfb] = useState<WebVitalMetric | null>(null);
  const [inp, setInp] = useState<WebVitalMetric | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(enableRealtime);

  const metricsRef = useRef<WebVitalsData | null>(null);
  const reportTimerRef = useRef<number | undefined>(undefined);
  const latestMetricsRef = useRef<
    Pick<WebVitalsData, "lcp" | "fid" | "cls" | "fcp" | "ttfb" | "inp">
  >({ lcp, fid, cls, fcp, ttfb, inp });

  // Convert web-vitals Metric to WebVitalMetric
  const convertMetric = useCallback((metric: Metric): WebVitalMetric => {
    const name = metric.name as WebVitalMetric["name"];
    const rating = getWebVitalRating(name, metric.value);

    return {
      name,
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now(),
      navigationType: metric.navigationType,
    };
  }, []);

  // Update metric and notify
  const updateMetric = useCallback(
    (metric: WebVitalMetric) => {
      switch (metric.name) {
        case "LCP":
          setLcp(metric);
          break;
        case "CLS":
          setCls(metric);
          break;
        case "FCP":
          setFcp(metric);
          break;
        case "TTFB":
          setTtfb(metric);
          break;
        case "INP":
          setInp(metric);
          break;
      }

      if (onMetricUpdate) {
        onMetricUpdate(metric);
      }
    },
    [onMetricUpdate]
  );

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (reportTimerRef.current) {
      window.clearInterval(reportTimerRef.current);
      reportTimerRef.current = undefined;
    }
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setLcp(null);
    setCls(null);
    setFcp(null);
    setTtfb(null);
    setInp(null);
    metricsRef.current = null;
  }, []);

  // Set up Web Vitals monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    // LCP - Largest Contentful Paint
    onLCP((metric) => {
      const webVital = convertMetric(metric);
      updateMetric(webVital);
    });

    // CLS - Cumulative Layout Shift
    onCLS((metric) => {
      const webVital = convertMetric(metric);
      updateMetric(webVital);
    });

    // FCP - First Contentful Paint
    onFCP((metric) => {
      const webVital = convertMetric(metric);
      updateMetric(webVital);
    });

    // TTFB - Time to First Byte
    onTTFB((metric) => {
      const webVital = convertMetric(metric);
      updateMetric(webVital);
    });

    // INP - Interaction to Next Paint
    onINP((metric) => {
      const webVital = convertMetric(metric);
      updateMetric(webVital);
    });

    // Note: web-vitals v4+ doesn't return cleanup functions
    // Metrics are automatically collected once per page load
  }, [isMonitoring, convertMetric, updateMetric]);

  // Latest measurements for the report timer below. The timer must not depend
  // on them, so they reach it through a ref instead of a closure.
  useEffect(() => {
    latestMetricsRef.current = { lcp, fid, cls, fcp, ttfb, inp };
  }, [lcp, fid, cls, fcp, ttfb, inp]);

  // Calculate overall score and report to context.
  //
  // The interval is armed once per monitoring session. This effect used to
  // depend on the metrics it reports, so every incoming measurement tore the
  // timer down and started a fresh one: while vitals were still arriving faster
  // than `reportInterval` the interval never survived long enough to fire, and
  // the context got nothing during exactly the window it was meant to cover.
  useEffect(() => {
    if (!isMonitoring) return;

    reportTimerRef.current = window.setInterval(() => {
      const { lcp, fid, cls, fcp, ttfb, inp } = latestMetricsRef.current;

      const score = calculateWebVitalsScore({
        lcp: lcp?.value,
        fid: fid?.value,
        cls: cls?.value,
      });

      const vitalsData: WebVitalsData = {
        lcp,
        fid,
        cls,
        fcp,
        ttfb,
        inp,
        overallScore: score,
        timestamp: Date.now(),
      };

      metricsRef.current = vitalsData;
      updateWebVitals(vitalsData);
    }, reportInterval);

    return () => {
      if (reportTimerRef.current) {
        window.clearInterval(reportTimerRef.current);
        reportTimerRef.current = undefined;
      }
    };
  }, [isMonitoring, reportInterval, updateWebVitals]);

  // Calculate current overall score
  const overallScore = calculateWebVitalsScore({
    lcp: lcp?.value,
    fid: fid?.value,
    cls: cls?.value,
  });

  const vitalsData = metricsRef.current;

  return {
    lcp,
    fid,
    cls,
    fcp,
    ttfb,
    inp,
    overallScore,
    vitalsData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics,
  };
}
