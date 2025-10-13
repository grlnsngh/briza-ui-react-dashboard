/**
 * Performance Context
 *
 * Global state management for performance monitoring data using React Context API.
 * Provides performance metrics, filters, and actions to all child components.
 *
 * @example
 * ```tsx
 * import { usePerformanceContext } from '@contexts/PerformanceContext';
 *
 * function MyComponent() {
 *   const { metrics, addMeasurement, filters, setFilters } = usePerformanceContext();
 *   // Use performance data and actions
 * }
 * ```
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import type {
  ComponentPerformanceMetrics,
  DashboardFilters,
  DashboardState,
  PerformanceMeasurement,
  WebVitalsData,
} from "../types/performance";
import { getStorageItem, setStorageItem } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";

// =============================================================================
// CONTEXT STATE
// =============================================================================

interface PerformanceState {
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

type PerformanceAction =
  | { type: "ADD_MEASUREMENT"; payload: PerformanceMeasurement }
  | { type: "UPDATE_COMPONENT_METRIC"; payload: ComponentPerformanceMetrics }
  | { type: "UPDATE_WEB_VITALS"; payload: WebVitalsData }
  | { type: "SET_FILTERS"; payload: Partial<DashboardFilters> }
  | { type: "SET_SELECTED_COMPONENT"; payload: string | null }
  | { type: "TOGGLE_REALTIME"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "CLEAR_METRICS" }
  | { type: "RESET_STATE" }
  | { type: "LOAD_MOCK_DATA"; payload: ComponentPerformanceMetrics[] }
  | { type: "TOGGLE_DEMO_MODE"; payload: boolean };

// =============================================================================
// REDUCER
// =============================================================================

const initialFilters: DashboardFilters = {
  timeRange: "24h",
  components: [],
  metrics: [],
  showOnlyIssues: false,
  minPerformanceScore: 0,
};

const initialDashboard: DashboardState = {
  isLoading: false,
  error: null,
  filters: getStorageItem(STORAGE_KEYS.FILTERS, initialFilters),
  selectedComponent: null,
  isRealTimeEnabled: getStorageItem(STORAGE_KEYS.REALTIME_ENABLED, false),
  lastUpdate: Date.now(),
};

const initialState: PerformanceState = {
  componentMetrics: new Map(),
  webVitals: null,
  dashboard: initialDashboard,
  measurements: [],
  isDemoMode: false,
};

function performanceReducer(
  state: PerformanceState,
  action: PerformanceAction
): PerformanceState {
  switch (action.type) {
    case "ADD_MEASUREMENT":
      return {
        ...state,
        measurements: [...state.measurements, action.payload].slice(-1000), // Keep last 1000
      };

    case "UPDATE_COMPONENT_METRIC": {
      const newMetrics = new Map(state.componentMetrics);
      newMetrics.set(action.payload.componentName, action.payload);
      return {
        ...state,
        componentMetrics: newMetrics,
        dashboard: {
          ...state.dashboard,
          lastUpdate: Date.now(),
        },
      };
    }

    case "UPDATE_WEB_VITALS":
      return {
        ...state,
        webVitals: action.payload,
        dashboard: {
          ...state.dashboard,
          lastUpdate: Date.now(),
        },
      };

    case "SET_FILTERS": {
      const newFilters = { ...state.dashboard.filters, ...action.payload };
      setStorageItem(STORAGE_KEYS.FILTERS, newFilters);
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          filters: newFilters,
        },
      };
    }

    case "SET_SELECTED_COMPONENT":
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          selectedComponent: action.payload,
        },
      };

    case "TOGGLE_REALTIME":
      setStorageItem(STORAGE_KEYS.REALTIME_ENABLED, action.payload);
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          isRealTimeEnabled: action.payload,
        },
      };

    case "SET_LOADING":
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          isLoading: action.payload,
        },
      };

    case "SET_ERROR":
      return {
        ...state,
        dashboard: {
          ...state.dashboard,
          error: action.payload,
          isLoading: false,
        },
      };

    case "CLEAR_METRICS":
      return {
        ...state,
        componentMetrics: new Map(),
        measurements: [],
      };

    case "RESET_STATE":
      return initialState;

    case "LOAD_MOCK_DATA": {
      const newMetrics = new Map(state.componentMetrics);
      action.payload.forEach((metric) => {
        newMetrics.set(metric.componentName, metric);
      });
      return {
        ...state,
        componentMetrics: newMetrics,
        isDemoMode: true,
        dashboard: {
          ...state.dashboard,
          lastUpdate: Date.now(),
        },
      };
    }

    case "TOGGLE_DEMO_MODE":
      return {
        ...state,
        isDemoMode: action.payload,
        componentMetrics: action.payload ? state.componentMetrics : new Map(),
      };

    default:
      return state;
  }
}

// =============================================================================
// CONTEXT
// =============================================================================

interface PerformanceContextValue {
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

const PerformanceContext = createContext<PerformanceContextValue | undefined>(
  undefined
);

// =============================================================================
// PROVIDER
// =============================================================================

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  // Actions
  const addMeasurement = useCallback((measurement: PerformanceMeasurement) => {
    dispatch({ type: "ADD_MEASUREMENT", payload: measurement });
  }, []);

  const updateComponentMetric = useCallback(
    (metric: ComponentPerformanceMetrics) => {
      dispatch({ type: "UPDATE_COMPONENT_METRIC", payload: metric });
    },
    []
  );

  const updateWebVitals = useCallback((vitals: WebVitalsData) => {
    dispatch({ type: "UPDATE_WEB_VITALS", payload: vitals });
  }, []);

  const setFilters = useCallback((filters: Partial<DashboardFilters>) => {
    dispatch({ type: "SET_FILTERS", payload: filters });
  }, []);

  const setSelectedComponent = useCallback((componentName: string | null) => {
    dispatch({ type: "SET_SELECTED_COMPONENT", payload: componentName });
  }, []);

  const toggleRealtime = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_REALTIME", payload: enabled });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  }, []);

  const clearMetrics = useCallback(() => {
    dispatch({ type: "CLEAR_METRICS" });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
  }, []);

  const loadMockData = useCallback((data: ComponentPerformanceMetrics[]) => {
    dispatch({ type: "LOAD_MOCK_DATA", payload: data });
  }, []);

  const toggleDemoMode = useCallback((enabled: boolean) => {
    dispatch({ type: "TOGGLE_DEMO_MODE", payload: enabled });
  }, []);

  // Selectors
  const getComponentMetric = useCallback(
    (componentName: string) => {
      return state.componentMetrics.get(componentName);
    },
    [state.componentMetrics]
  );

  const getFilteredComponents = useCallback(() => {
    const components = Array.from(state.componentMetrics.values());
    const { filters } = state.dashboard;

    return components.filter((metric) => {
      // Filter by component name
      if (
        filters.components.length > 0 &&
        !filters.components.includes(metric.componentName)
      ) {
        return false;
      }

      // Filter by performance score
      if (metric.performanceScore < filters.minPerformanceScore) {
        return false;
      }

      // Filter by issues
      if (filters.showOnlyIssues && metric.performanceScore >= 70) {
        return false;
      }

      return true;
    });
  }, [state.componentMetrics, state.dashboard]);

  // Persist data to localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const data = {
        componentMetrics: Array.from(state.componentMetrics.entries()),
        webVitals: state.webVitals,
        timestamp: Date.now(),
      };
      setStorageItem(STORAGE_KEYS.PERFORMANCE_DATA, data);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [state.componentMetrics, state.webVitals]);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = getStorageItem<{
      componentMetrics: [string, ComponentPerformanceMetrics][];
      webVitals: WebVitalsData | null;
      timestamp: number;
    } | null>(STORAGE_KEYS.PERFORMANCE_DATA, null);

    if (persisted && Date.now() - persisted.timestamp < 24 * 60 * 60 * 1000) {
      // Load if less than 24 hours old
      persisted.componentMetrics.forEach(([, metric]) => {
        updateComponentMetric(metric);
      });
      if (persisted.webVitals) {
        updateWebVitals(persisted.webVitals);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const value = useMemo(
    () => ({
      state,
      addMeasurement,
      updateComponentMetric,
      updateWebVitals,
      setFilters,
      setSelectedComponent,
      toggleRealtime,
      setLoading,
      setError,
      clearMetrics,
      resetState,
      getComponentMetric,
      getFilteredComponents,
      loadMockData,
      toggleDemoMode,
    }),
    [
      state,
      addMeasurement,
      updateComponentMetric,
      updateWebVitals,
      setFilters,
      setSelectedComponent,
      toggleRealtime,
      setLoading,
      setError,
      clearMetrics,
      resetState,
      getComponentMetric,
      getFilteredComponents,
      loadMockData,
      toggleDemoMode,
    ]
  );

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access performance context
 *
 * @throws Error if used outside of PerformanceProvider
 */
export function usePerformanceContext() {
  const context = useContext(PerformanceContext);

  if (context === undefined) {
    throw new Error(
      "usePerformanceContext must be used within a PerformanceProvider"
    );
  }

  return context;
}
