/**
 * useComponentPerformance Hook
 *
 * Custom React hook for tracking component performance metrics including
 * render count, render time, and memory usage.
 *
 * Measurement model
 * -----------------
 * Samples are accumulated into refs on every commit and published to React
 * state (and to the performance context) on a fixed interval. Nothing is
 * written to state during measurement itself, because a metrics hook that
 * re-renders its host on every render would feed on its own output.
 *
 * For per-commit accuracy backed by React's own instrumentation, prefer
 * wrapping the subtree in `<MonitoredComponent>`, which uses `<Profiler>`.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { renderCount, avgRenderTime, performanceScore } = useComponentPerformance({
 *     componentName: 'MyComponent',
 *     trackMemory: true,
 *   });
 *
 *   return <div>Renders: {renderCount}, Avg Time: {avgRenderTime}ms</div>;
 * }
 * ```
 */

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import type {
  ComponentPerformanceMetrics,
  PerformanceMeasurement,
} from "../types/performance";
import { usePerformanceActions } from "../contexts";
import { calculatePerformanceScore } from "../utils";

// =============================================================================
// TYPES
// =============================================================================

interface UseComponentPerformanceOptions {
  /** Name of the component to track */
  componentName: string;
  /** Whether to track memory usage */
  trackMemory?: boolean;
  /** Whether to track renders */
  trackRenders?: boolean;
  /** Whether to automatically report to context */
  autoReport?: boolean;
  /**
   * How often (ms) accumulated samples are published to state and context.
   * Lower values refresh the UI sooner at the cost of more re-renders.
   */
  publishInterval?: number;
}

interface UseComponentPerformanceReturn {
  /** Number of times component has rendered */
  renderCount: number;
  /** Average render time in milliseconds */
  avgRenderTime: number;
  /** Last render time in milliseconds */
  lastRenderTime: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Whether tracking is active */
  isTracking: boolean;
  /** Start tracking */
  startTracking: () => void;
  /** Stop tracking */
  stopTracking: () => void;
  /** Reset metrics */
  resetMetrics: () => void;
  /** Get full metrics object */
  getMetrics: () => ComponentPerformanceMetrics;
}

/** Maximum number of render samples retained in memory */
const MAX_SAMPLES = 100;

// =============================================================================
// HOOK
// =============================================================================

export function useComponentPerformance({
  componentName,
  trackMemory = false,
  trackRenders = true,
  autoReport = true,
  publishInterval = 1000,
}: UseComponentPerformanceOptions): UseComponentPerformanceReturn {
  // Actions only: a metrics hook that re-rendered its host on every
  // measurement would feed on its own output.
  const { updateComponentMetric } = usePerformanceActions();

  const [renderCount, setRenderCount] = useState(0);
  const [avgRenderTime, setAvgRenderTime] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [isTracking, setIsTracking] = useState(trackRenders);

  // Running totals live in refs so recording a sample never triggers a render.
  const renderSamplesRef = useRef<PerformanceMeasurement[]>([]);
  const renderCountRef = useRef(0);
  const totalRenderTimeRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const lastRenderTimestampRef = useRef(Date.now());
  const memoryUsageRef = useRef(0);

  // Number of samples already pushed to state, so an idle component publishes nothing.
  const publishedCountRef = useRef(0);
  // Marks the render caused by our own publish, so it is not counted as a sample.
  const selfInducedRenderRef = useRef(false);

  // Latest options, readable from the publish timer without re-arming it.
  const optionsRef = useRef({
    componentName,
    trackMemory,
    autoReport,
    updateComponentMetric,
  });
  useEffect(() => {
    optionsRef.current = {
      componentName,
      trackMemory,
      autoReport,
      updateComponentMetric,
    };
  }, [componentName, trackMemory, autoReport, updateComponentMetric]);

  // Read during the render phase so the delta below spans this component's
  // render plus commit, rather than the gap between two effects in one commit.
  const renderStart = performance.now();

  // Record one sample per commit. Intentionally has no dependency array: it must
  // run after every render, which is only safe because it never calls setState.
  useLayoutEffect(() => {
    if (!isTracking) return;

    // Skip the render we caused ourselves when publishing.
    if (selfInducedRenderRef.current) {
      selfInducedRenderRef.current = false;
      return;
    }

    const duration = performance.now() - renderStart;

    renderCountRef.current += 1;
    lastRenderTimeRef.current = duration;
    lastRenderTimestampRef.current = Date.now();
    totalRenderTimeRef.current += duration;

    renderSamplesRef.current.push({
      name: `${optionsRef.current.componentName}-render-${renderCountRef.current}`,
      startTime: renderStart,
      duration,
      timestamp: Date.now(),
    });

    if (renderSamplesRef.current.length > MAX_SAMPLES) {
      renderSamplesRef.current.shift();
    }

    if (optionsRef.current.trackMemory && "memory" in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      if (memory) {
        memoryUsageRef.current = memory.usedJSHeapSize;
      }
    }
  });

  const buildMetrics = useCallback((): ComponentPerformanceMetrics => {
    const samples = renderSamplesRef.current;
    const avg = samples.length
      ? samples.reduce((sum, sample) => sum + sample.duration, 0) /
        samples.length
      : 0;

    return {
      componentName: optionsRef.current.componentName,
      renderCount: renderCountRef.current,
      avgRenderTime: avg,
      lastRenderTime: lastRenderTimeRef.current,
      totalRenderTime: totalRenderTimeRef.current,
      memoryUsage: optionsRef.current.trackMemory
        ? memoryUsageRef.current
        : undefined,
      // Bundle size is not observable from inside a component, so it is passed
      // as 0 rather than conflated with heap usage, which is process-wide.
      performanceScore: calculatePerformanceScore(
        avg,
        0,
        renderCountRef.current
      ),
      lastRenderTimestamp: lastRenderTimestampRef.current,
      renderHistory: [...samples],
      isTracking,
    };
  }, [isTracking]);

  // Publish accumulated samples on an interval. This is the only place that
  // writes state, which keeps measurement and re-rendering decoupled.
  useEffect(() => {
    if (!isTracking) return;

    const publish = () => {
      // Nothing new since the last publish: stay quiet so an idle component settles.
      if (renderCountRef.current === publishedCountRef.current) return;
      publishedCountRef.current = renderCountRef.current;

      const metrics = buildMetrics();

      selfInducedRenderRef.current = true;
      setRenderCount(metrics.renderCount);
      setAvgRenderTime(metrics.avgRenderTime);
      setLastRenderTime(metrics.lastRenderTime);
      if (optionsRef.current.trackMemory) {
        setMemoryUsage(memoryUsageRef.current);
      }

      if (optionsRef.current.autoReport) {
        optionsRef.current.updateComponentMetric(metrics);
      }
    };

    const interval = window.setInterval(publish, publishInterval);
    return () => window.clearInterval(interval);
  }, [isTracking, publishInterval, buildMetrics]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  const resetMetrics = useCallback(() => {
    renderSamplesRef.current = [];
    renderCountRef.current = 0;
    totalRenderTimeRef.current = 0;
    lastRenderTimeRef.current = 0;
    lastRenderTimestampRef.current = Date.now();
    memoryUsageRef.current = 0;
    publishedCountRef.current = 0;

    selfInducedRenderRef.current = true;
    setRenderCount(0);
    setAvgRenderTime(0);
    setLastRenderTime(0);
    setMemoryUsage(0);
  }, []);

  const performanceScore = calculatePerformanceScore(
    avgRenderTime,
    0,
    renderCount
  );

  return {
    renderCount,
    avgRenderTime,
    lastRenderTime,
    memoryUsage,
    performanceScore,
    isTracking,
    startTracking,
    stopTracking,
    resetMetrics,
    getMetrics: buildMetrics,
  };
}

// =============================================================================
// TYPES FOR MEMORY API
// =============================================================================

interface PerformanceMemory {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}
