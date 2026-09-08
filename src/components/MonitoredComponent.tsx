/**
 * Monitored Component Wrapper
 *
 * Wraps any component with React Profiler to automatically capture
 * performance metrics without requiring manual hook usage.
 *
 * Measurement model
 * -----------------
 * Running totals live in a ref and are advanced once per commit. A short debounce
 * publishes them to the context, so a burst of renders costs one state update
 * instead of one per render.
 *
 * The totals must not be derived from context state: the publish is debounced, so
 * every render inside a window would read the same not-yet-updated base and the
 * count would collapse to one per window. The ref is the only source of truth for
 * accumulation; context is read once, to seed it.
 */

import {
  Profiler,
  type ProfilerOnRenderCallback,
  type ReactNode,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { usePerformanceActions } from "../contexts";
import type {
  ComponentPerformanceMetrics,
  PerformanceMeasurement,
} from "../types/performance";

/** Quiet period before accumulated renders are published to the context. */
const PUBLISH_DEBOUNCE_MS = 100;

/** Number of individual render samples retained per component. */
const MAX_RENDER_HISTORY = 50;

interface MonitoredComponentProps {
  /** Name of the component being monitored */
  name: string;
  /** Child components to monitor */
  children: ReactNode;
  /** Whether to track this component */
  enabled?: boolean;
}

/** Running totals for one profiler id. Mutated in place, never rendered. */
interface RenderTotals {
  renderCount: number;
  totalRenderTime: number;
  lastRenderTime: number;
  lastRenderTimestamp: number;
  renderHistory: PerformanceMeasurement[];
  memoryUsage?: number;
  performanceScore: number;
}

function emptyMetric(componentName: string): ComponentPerformanceMetrics {
  return {
    componentName,
    renderCount: 0,
    avgRenderTime: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
    performanceScore: 100,
    lastRenderTimestamp: Date.now(),
    renderHistory: [],
    isTracking: true,
  };
}

/**
 * Wraps children with React Profiler for automatic performance monitoring
 */
export function MonitoredComponent({
  name,
  children,
  enabled = true,
}: MonitoredComponentProps) {
  // Actions only: this component records measurements, so subscribing to them
  // would make it re-render on its own output and measure that render too.
  const { updateComponentMetric, getComponentMetric } = usePerformanceActions();

  const totalsRef = useRef<Map<string, RenderTotals>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());
  const publishTimerRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    publishTimerRef.current = null;

    pendingRef.current.forEach((componentName) => {
      const totals = totalsRef.current.get(componentName);
      if (!totals) return;

      updateComponentMetric({
        componentName,
        renderCount: totals.renderCount,
        avgRenderTime: totals.renderCount
          ? totals.totalRenderTime / totals.renderCount
          : 0,
        lastRenderTime: totals.lastRenderTime,
        totalRenderTime: totals.totalRenderTime,
        memoryUsage: totals.memoryUsage,
        performanceScore: totals.performanceScore,
        lastRenderTimestamp: totals.lastRenderTimestamp,
        renderHistory: [...totals.renderHistory],
        isTracking: true,
      });
    });

    pendingRef.current.clear();
  }, [updateComponentMetric]);

  // Register the component up front so it appears in the dashboard even if the
  // profiler has not committed a sample yet.
  useEffect(() => {
    if (!enabled) return;
    if (getComponentMetric(name)) return;

    updateComponentMetric(emptyMetric(name));
  }, [name, enabled, getComponentMetric, updateComponentMetric]);

  // Publish anything still buffered, then drop the timer. Without this the
  // pending timeout outlives the component and fires against a dead closure.
  useEffect(() => {
    return () => {
      if (publishTimerRef.current !== null) {
        window.clearTimeout(publishTimerRef.current);
        publishTimerRef.current = null;
        flush();
      }
    };
  }, [flush]);

  const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    _phase,
    actualDuration,
    _baseDuration,
    startTime,
    commitTime
  ) => {
    if (!enabled) return;

    let totals = totalsRef.current.get(id);
    if (!totals) {
      // Seed once from whatever the store already holds — a restored session or
      // an earlier mount — so remounting continues the count instead of
      // restarting it. Every later sample comes off the ref.
      const existing = getComponentMetric(id);
      totals = {
        renderCount: existing?.renderCount ?? 0,
        totalRenderTime: existing?.totalRenderTime ?? 0,
        lastRenderTime: existing?.lastRenderTime ?? 0,
        lastRenderTimestamp: existing?.lastRenderTimestamp ?? Date.now(),
        renderHistory: existing ? [...existing.renderHistory] : [],
        memoryUsage: existing?.memoryUsage,
        performanceScore: existing?.performanceScore ?? 100,
      };
      totalsRef.current.set(id, totals);
    }

    totals.renderCount += 1;
    totals.totalRenderTime += actualDuration;
    totals.lastRenderTime = actualDuration;
    totals.lastRenderTimestamp = commitTime;

    totals.renderHistory.push({
      name: `${id}-render-${totals.renderCount}`,
      startTime,
      duration: actualDuration,
      timestamp: commitTime,
    });
    if (totals.renderHistory.length > MAX_RENDER_HISTORY) {
      totals.renderHistory.splice(
        0,
        totals.renderHistory.length - MAX_RENDER_HISTORY
      );
    }

    // Calculate performance score
    let score = 100;
    if (actualDuration > 16) score -= 30; // Missed 60fps frame
    else if (actualDuration > 8) score -= 15;
    else if (actualDuration > 4) score -= 5;

    // Track memory if available
    if ("memory" in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory;
      if (memory) {
        totals.memoryUsage = memory.usedJSHeapSize;
        // Penalize high memory usage
        if (totals.memoryUsage > 1000000) score -= 20;
        else if (totals.memoryUsage > 500000) score -= 10;
      }
    }

    totals.performanceScore = Math.max(0, Math.min(100, score));

    // Batch: a burst of renders publishes once, after it settles.
    pendingRef.current.add(id);
    if (publishTimerRef.current !== null) {
      window.clearTimeout(publishTimerRef.current);
    }
    publishTimerRef.current = window.setTimeout(flush, PUBLISH_DEBOUNCE_MS);
  };

  return (
    <Profiler id={name} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
}
