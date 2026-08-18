/**
 * Performance Context Instance
 *
 * Holds the context object and its value types, kept separate from the provider
 * component so that `PerformanceContext.tsx` exports only a component and stays
 * eligible for React Fast Refresh.
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
// CONTEXT VALUE
// =============================================================================

export interface PerformanceContextValue {
  /** Current state */
  state: PerformanceState;
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

export const PerformanceContext = createContext<
  PerformanceContextValue | undefined
>(undefined);
