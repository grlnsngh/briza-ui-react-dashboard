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
  // `enableRealtime` is the source of truth. `startMonitoring`/`stopMonitoring`
  // layer an imperative override on top of it, and any change to the prop drops
  // that override so the caller's flag takes over again. Seeding state from the
  // prop once is what made the header toggle a no-op: the hook never saw it move.
  const [monitoringOverride, setMonitoringOverride] = useState<boolean | null>(
    null
  );
  const [lastEnableRealtime, setLastEnableRealtime] = useState(enableRealtime);

  if (lastEnableRealtime !== enableRealtime) {
    setLastEnableRealtime(enableRealtime);
    setMonitoringOverride(null);
  }

  const isMonitoring = monitoringOverride ?? enableRealtime;

  const metricsRef = useRef<WebVitalsData | null>(null);
  const reportTimerRef = useRef<number | undefined>(undefined);

  // Whether a monitoring session is currently running. Read by the web-vitals
  // callbacks, which outlive any single session (see the subscription effect).
  const isCollectingRef = useRef(false);
  const hasSubscribedRef = useRef(false);
  const reportRef = useRef<(metric: Metric) => void>(() => {});

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

  // Start monitoring, overriding `enableRealtime` until the prop next changes
  const startMonitoring = useCallback(() => {
    setMonitoringOverride(true);
  }, []);

  // Stop monitoring, overriding `enableRealtime` until the prop next changes.
  // The report timer belongs to its own effect, whose cleanup runs as soon as
  // `isMonitoring` flips — clearing it here too would fight that owner.
  const stopMonitoring = useCallback(() => {
    setMonitoringOverride(false);
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

  // Keep the reporter the web-vitals callbacks reach for current. Declared
  // ahead of the subscription effect so it is already populated by the time the
  // observers below are attached.
  useEffect(() => {
    reportRef.current = (metric: Metric) => {
      updateMetric(convertMetric(metric));
    };
  }, [convertMetric, updateMetric]);

  // Set up Web Vitals monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    isCollectingRef.current = true;

    // web-vitals v4+ hands back no unsubscribe, and calling on*() again would
    // stack another observer — and another metric id — onto the page for every
    // toggle. So the observers are attached once, on the first activation, and
    // `isCollectingRef` connects and disconnects them from then on: the cleanup
    // below detaches collection, re-enabling reattaches it.
    if (!hasSubscribedRef.current) {
      hasSubscribedRef.current = true;

      const report = (metric: Metric) => {
        if (!isCollectingRef.current) return;
        reportRef.current(metric);
      };

      onLCP(report); // Largest Contentful Paint
      onCLS(report); // Cumulative Layout Shift
      onFCP(report); // First Contentful Paint
      onTTFB(report); // Time to First Byte
      onINP(report); // Interaction to Next Paint
    }

    return () => {
      isCollectingRef.current = false;
    };
  }, [isMonitoring]);

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
