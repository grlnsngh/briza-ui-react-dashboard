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
import { usePerformanceContext } from "../contexts";
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
  const { updateWebVitals } = usePerformanceContext();

  const [lcp, setLcp] = useState<WebVitalMetric | null>(null);
  const [fid] = useState<WebVitalMetric | null>(null); // FID is deprecated, kept for compatibility
  const [cls, setCls] = useState<WebVitalMetric | null>(null);
  const [fcp, setFcp] = useState<WebVitalMetric | null>(null);
  const [ttfb, setTtfb] = useState<WebVitalMetric | null>(null);
  const [inp, setInp] = useState<WebVitalMetric | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(enableRealtime);

  const metricsRef = useRef<WebVitalsData | null>(null);
  const reportTimerRef = useRef<number | undefined>(undefined);

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
      clearInterval(reportTimerRef.current);
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

  // Calculate overall score and report to context
  useEffect(() => {
    if (!isMonitoring) return;

    reportTimerRef.current = setInterval(() => {
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
        clearInterval(reportTimerRef.current);
      }
    };
  }, [
    isMonitoring,
    lcp,
    fid,
    cls,
    fcp,
    ttfb,
    inp,
    reportInterval,
    updateWebVitals,
  ]);

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
