/**
 * Monitored Component Wrapper
 *
 * Wraps any component with React Profiler to automatically capture
 * performance metrics without requiring manual hook usage.
 */

import { Profiler, type ProfilerOnRenderCallback, type ReactNode } from "react";
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
  let updateComponentMetric;
  let state;

  try {
    const context = usePerformanceContext();
    updateComponentMetric = context.updateComponentMetric;
    state = context.state;
  } catch (error) {
    console.error(
      "MonitoredComponent: Failed to get PerformanceContext",
      error
    );
    // If context is not available, just render children without monitoring
    return <>{children}</>;
  }

  const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    _phase,
    actualDuration,
    _baseDuration,
    startTime,
    commitTime
  ) => {
    if (!enabled || !updateComponentMetric || !state) return;

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

    // Update context
    updateComponentMetric(updatedMetric);
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
