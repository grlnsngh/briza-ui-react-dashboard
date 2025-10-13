/**
 * useComponentPerformance Hook
 *
 * Custom React hook for tracking component performance metrics including
 * render count, render time, and memory usage using React Profiler API.
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

import { useEffect, useRef, useState, useCallback } from "react";
import type { ComponentPerformanceMetrics } from "../types/performance";
import { usePerformanceContext } from "../contexts";
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

// =============================================================================
// HOOK
// =============================================================================

export function useComponentPerformance({
  componentName,
  trackMemory = false,
  trackRenders = true,
  autoReport = true,
}: UseComponentPerformanceOptions): UseComponentPerformanceReturn {
  const { updateComponentMetric } = usePerformanceContext();

  const [renderCount, setRenderCount] = useState(0);
  const [avgRenderTime, setAvgRenderTime] = useState(0);
  const [lastRenderTime, setLastRenderTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [isTracking, setIsTracking] = useState(trackRenders);

  const renderTimesRef = useRef<number[]>([]);
  const lastRenderStartRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(Date.now());

  // Track render start time
  useEffect(() => {
    if (!isTracking) return;

    lastRenderStartRef.current = performance.now();
  });

  // Track render completion and calculate metrics
  useEffect(() => {
    if (!isTracking) return;

    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - lastRenderStartRef.current;

    // Update render count
    setRenderCount((prev) => prev + 1);

    // Update render times
    renderTimesRef.current.push(renderDuration);

    // Keep only last 100 render times to prevent memory leak
    if (renderTimesRef.current.length > 100) {
      renderTimesRef.current.shift();
    }

    // Calculate average
    const avg =
      renderTimesRef.current.reduce((sum, time) => sum + time, 0) /
      renderTimesRef.current.length;

    setAvgRenderTime(avg);
    setLastRenderTime(renderDuration);

    // Track memory usage if enabled and available
    if (trackMemory && "memory" in performance) {
      const memory = (performance as PerformanceWithMemory).memory;
      if (memory) {
        setMemoryUsage(memory.usedJSHeapSize);
      }
    }

    // Auto-report to context
    if (autoReport) {
      const performanceScore = calculatePerformanceScore(
        avg,
        memoryUsage,
        renderCount
      );

      const metrics: ComponentPerformanceMetrics = {
        componentName,
        renderCount: renderCount + 1,
        avgRenderTime: avg,
        lastRenderTime: renderDuration,
        totalRenderTime: renderTimesRef.current.reduce((sum, t) => sum + t, 0),
        memoryUsage: trackMemory ? memoryUsage : undefined,
        performanceScore,
        lastRenderTimestamp: Date.now(),
        renderHistory: renderTimesRef.current.map((time, index) => ({
          name: `${componentName}-render-${index}`,
          startTime: mountTimeRef.current + index * 100, // Approximate
          duration: time,
          timestamp: Date.now() - (renderTimesRef.current.length - index) * 100,
        })),
        isTracking,
      };

      updateComponentMetric(metrics);
    }
  }, [
    isTracking,
    componentName,
    trackMemory,
    memoryUsage,
    renderCount,
    autoReport,
    updateComponentMetric,
  ]);

  // Start tracking
  const startTracking = useCallback(() => {
    setIsTracking(true);
  }, []);

  // Stop tracking
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setRenderCount(0);
    setAvgRenderTime(0);
    setLastRenderTime(0);
    setMemoryUsage(0);
    renderTimesRef.current = [];
    mountTimeRef.current = Date.now();
  }, []);

  // Get full metrics object
  const getMetrics = useCallback((): ComponentPerformanceMetrics => {
    const performanceScore = calculatePerformanceScore(
      avgRenderTime,
      memoryUsage,
      renderCount
    );

    return {
      componentName,
      renderCount,
      avgRenderTime,
      lastRenderTime,
      totalRenderTime: renderTimesRef.current.reduce((sum, t) => sum + t, 0),
      memoryUsage: trackMemory ? memoryUsage : undefined,
      performanceScore,
      lastRenderTimestamp: Date.now(),
      renderHistory: renderTimesRef.current.map((time, index) => ({
        name: `${componentName}-render-${index}`,
        startTime: mountTimeRef.current + index * 100,
        duration: time,
        timestamp: Date.now() - (renderTimesRef.current.length - index) * 100,
      })),
      isTracking,
    };
  }, [
    componentName,
    renderCount,
    avgRenderTime,
    lastRenderTime,
    memoryUsage,
    trackMemory,
    isTracking,
  ]);

  const performanceScore = calculatePerformanceScore(
    avgRenderTime,
    memoryUsage,
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
    getMetrics,
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
