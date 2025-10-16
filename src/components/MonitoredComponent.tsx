/**
 * Monitored Component Wrapper
 *
 * Wraps any component with React Profiler to automatically capture
 * performance metrics without requiring manual hook usage.
 */

import {
  Profiler,
  type ProfilerOnRenderCallback,
  type ReactNode,
  useRef,
  useCallback,
} from "react";
import { usePerformanceContext } from "../contexts";
import type { ComponentPerformanceMetrics } from "../types/performance";

interface MonitoredComponentProps {
  /** Name of the component being monitored */
  name: string;
  /** Child components to monitor */
  children: ReactNode;
  /** Whether to track this component */
  enabled?: boolean;
}

/**
 * Wraps children with React Profiler for automatic performance monitoring
 */
export function MonitoredComponent({
  name,
  children,
  enabled = true,
}: MonitoredComponentProps) {
  // Always call hooks at the top level
  const context = usePerformanceContext();
  const { updateComponentMetric, state } = context;

  // Use ref to debounce updates and prevent infinite loops
  const updateTimerRef = useRef<number | null>(null);
  const localMetricsRef = useRef<Map<string, ComponentPerformanceMetrics>>(
    new Map()
  );

  // Debounced update function to batch metric updates
  const debouncedUpdate = useCallback(
    (metric: ComponentPerformanceMetrics) => {
      // Store metric locally first
      localMetricsRef.current.set(metric.componentName, metric);

      // Clear existing timer
      if (updateTimerRef.current) {
        window.clearTimeout(updateTimerRef.current);
      }

      // Batch update after 100ms of no new renders
      updateTimerRef.current = window.setTimeout(() => {
        const metricsToUpdate = Array.from(localMetricsRef.current.values());
        metricsToUpdate.forEach((m) => updateComponentMetric(m));
        localMetricsRef.current.clear();
      }, 100);
    },
    [updateComponentMetric]
  );

  const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    _phase,
    actualDuration,
    _baseDuration,
    startTime,
    commitTime
  ) => {
    if (!enabled) return;

    // Get existing data or create new
    const currentMetric = state.componentMetrics.get(id) || {
      componentName: id,
      renderCount: 0,
      avgRenderTime: 0,
      lastRenderTime: 0,
      totalRenderTime: 0,
      performanceScore: 100,
      lastRenderTimestamp: Date.now(),
      renderHistory: [],
      isTracking: true,
    };

    // Calculate new metrics
    const newRenderCount = currentMetric.renderCount + 1;
    const newTotalRenderTime = currentMetric.totalRenderTime + actualDuration;
    const newAvgRenderTime = newTotalRenderTime / newRenderCount;

    // Add to render history (keep last 50)
    const newRenderHistory = [
      ...currentMetric.renderHistory,
      {
        name: `${id}-render-${newRenderCount}`,
        startTime,
        duration: actualDuration,
        timestamp: commitTime,
      },
    ].slice(-50);

    // Calculate performance score
    let score = 100;
    if (actualDuration > 16) score -= 30; // Missed 60fps frame
    else if (actualDuration > 8) score -= 15;
    else if (actualDuration > 4) score -= 5;

    // Track memory if available
    let memoryUsage: number | undefined;
    if ("memory" in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory;
      if (memory) {
        memoryUsage = memory.usedJSHeapSize;
        // Penalize high memory usage
        if (memoryUsage && memoryUsage > 1000000) score -= 20;
        else if (memoryUsage && memoryUsage > 500000) score -= 10;
      }
    }

    const updatedMetric: ComponentPerformanceMetrics = {
      componentName: id,
      renderCount: newRenderCount,
      avgRenderTime: newAvgRenderTime,
      lastRenderTime: actualDuration,
      totalRenderTime: newTotalRenderTime,
      memoryUsage,
      performanceScore: Math.max(0, Math.min(100, score)),
      lastRenderTimestamp: commitTime,
      renderHistory: newRenderHistory,
      isTracking: true,
    };

    // Use debounced update to prevent infinite render loops
    debouncedUpdate(updatedMetric);
  };

  return (
    <Profiler id={name} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}

/**
 * HOC version for wrapping components
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const displayName =
    componentName || Component.displayName || Component.name || "Component";

  const WrappedComponent = (props: P) => (
    <MonitoredComponent name={displayName}>
      <Component {...props} />
    </MonitoredComponent>
  );

  WrappedComponent.displayName = `Monitored(${displayName})`;

  return WrappedComponent;
}
