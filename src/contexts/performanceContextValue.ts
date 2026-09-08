/**
 * Performance Context Instances
 *
 * Holds the context objects and their value types, kept separate from the
 * provider component so that `PerformanceContext.tsx` exports only a component
 * and stays eligible for React Fast Refresh.
 *
 * State and actions live in two separate contexts on purpose. Every measurement
 * produces a new state object, so a single combined context would re-render
 * every consumer — including the components doing the measuring, which then
 * measure their own re-render. Splitting them lets the measurement path
 * subscribe to the actions alone, which never change identity.
 */

import { createContext } from "react";
import type {
  ComponentPerformanceMetrics,
  DashboardFilters,
  DashboardState,
  PerformanceMeasurement,
  WebVitalsData,
} from "../types/performance";

// =============================================================================
// STATE
// =============================================================================

export interface PerformanceState {
  /** All component performance metrics */
  componentMetrics: Map<string, ComponentPerformanceMetrics>;
  /** Web Vitals data */
  webVitals: WebVitalsData | null;
  /** Dashboard state */
  dashboard: DashboardState;
  /** Raw performance measurements */
  measurements: PerformanceMeasurement[];
  /** Demo mode enabled */
  isDemoMode: boolean;
}

// =============================================================================
// ACTIONS
// =============================================================================

/**
 * Writers and selectors. This object is referentially stable for the lifetime
 * of the provider: every member is either a dispatch wrapper or a selector that
 * reads the latest state through a ref, so nothing here closes over state.
 */
export interface PerformanceActions {
  /**
   * Read the current state without subscribing to it. For callers that need
   * the latest values inside a timer or callback but must not re-render when
   * metrics change. Never call this during render — subscribe with
   * `usePerformanceState` instead, or the render will not track its own input.
   */
  getState: () => PerformanceState;
  /** Add a performance measurement */
  addMeasurement: (measurement: PerformanceMeasurement) => void;
  /** Update component metric */
  updateComponentMetric: (metric: ComponentPerformanceMetrics) => void;
  /** Update Web Vitals */
  updateWebVitals: (vitals: WebVitalsData) => void;
  /** Set dashboard filters */
  setFilters: (filters: Partial<DashboardFilters>) => void;
  /** Set selected component */
  setSelectedComponent: (componentName: string | null) => void;
  /** Toggle real-time monitoring */
  toggleRealtime: (enabled: boolean) => void;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Set error */
  setError: (error: string | null) => void;
  /** Clear all metrics */
  clearMetrics: () => void;
  /** Reset to initial state */
  resetState: () => void;
  /** Get metric for specific component */
  getComponentMetric: (
    componentName: string
  ) => ComponentPerformanceMetrics | undefined;
  /** Get filtered components */
  getFilteredComponents: () => ComponentPerformanceMetrics[];
  /** Load mock data for demo */
  loadMockData: (data: ComponentPerformanceMetrics[]) => void;
  /** Toggle demo mode */
  toggleDemoMode: (enabled: boolean) => void;
}

// =============================================================================
// CONTEXT VALUE
// =============================================================================

/** The combined shape returned by `usePerformanceContext`. */
export interface PerformanceContextValue extends PerformanceActions {
  /** Current state */
  state: PerformanceState;
}

/** Changes on every measurement. Subscribe only if you render state. */
export const PerformanceStateContext = createContext<
  PerformanceState | undefined
>(undefined);

/** Stable for the lifetime of the provider. Safe for the measurement path. */
export const PerformanceActionsContext = createContext<
  PerformanceActions | undefined
>(undefined);
