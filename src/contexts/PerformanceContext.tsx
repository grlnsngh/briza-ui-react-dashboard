/**
 * Performance Context
 *
 * Global state management for performance monitoring data using React Context API.
 * Provides performance metrics, filters, and actions to all child components.
 *
 * State and actions are published through two separate contexts so that the
 * components doing the measuring do not re-render on the measurements they
 * record. See `performanceContextValue.ts` for the split, and
 * `usePerformanceContext.ts` for which accessor to reach for.
 *
 * @example
 * ```tsx
 * import { usePerformanceContext } from '@contexts';
 *
 * function MyComponent() {
 *   const { state, addMeasurement, setFilters } = usePerformanceContext();
 *   // Use performance data and actions
 * }
 * ```
 */

import {
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type {
  ComponentPerformanceMetrics,
  DashboardFilters,
  DashboardState,
  WebVitalsData,
  PerformanceMeasurement,
} from "../types/performance";
import { getStorageItem, setStorageItem } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";
import {
  PerformanceActionsContext,
  PerformanceStateContext,
  type PerformanceActions,
  type PerformanceState,
} from "./performanceContextValue";

/** How often accumulated metrics are written to localStorage. */
const PERSIST_INTERVAL_MS = 30000;

/** Persisted metrics older than this are ignored on load. */
const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
// PROVIDER
// =============================================================================

interface PerformanceProviderProps {
  children: ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  // Mirror of the latest state, so the selectors below and the persistence
  // timer can read it without closing over it. Assigned during render rather
  // than in an effect because the selectors are called during a consumer's
  // render, which happens before the provider's own effects run.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Actions
  const getState = useCallback(() => stateRef.current, []);

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

  // Selectors. These read `stateRef` rather than `state` so that they stay
  // referentially stable and can live in the actions context.
  const getComponentMetric = useCallback((componentName: string) => {
    return stateRef.current.componentMetrics.get(componentName);
  }, []);

  const getFilteredComponents = useCallback(() => {
    const { componentMetrics, dashboard } = stateRef.current;
    const components = Array.from(componentMetrics.values());
    const { filters } = dashboard;

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
  }, []);

  // Persist data to localStorage periodically.
  //
  // The timer is armed once. It used to depend on the metrics it was saving,
  // so under active monitoring the effect was torn down and rebuilt faster than
  // the 30s interval could elapse and nothing was ever written.
  useEffect(() => {
    const persist = () => {
      const { componentMetrics, webVitals } = stateRef.current;
      setStorageItem(STORAGE_KEYS.PERFORMANCE_DATA, {
        componentMetrics: Array.from(componentMetrics.entries()),
        webVitals,
        timestamp: Date.now(),
      });
    };

    const interval = window.setInterval(persist, PERSIST_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      // Save whatever accumulated since the last tick.
      persist();
    };
  }, []);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = getStorageItem<{
      componentMetrics: [string, ComponentPerformanceMetrics][];
      webVitals: WebVitalsData | null;
      timestamp: number;
    } | null>(STORAGE_KEYS.PERFORMANCE_DATA, null);

    if (persisted && Date.now() - persisted.timestamp < PERSIST_MAX_AGE_MS) {
      persisted.componentMetrics.forEach(([, metric]) => {
        updateComponentMetric(metric);
      });
      if (persisted.webVitals) {
        updateWebVitals(persisted.webVitals);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Every member is stable, so this object is created once. Consumers that only
  // write metrics can subscribe here and stay out of the re-render path.
  const actions = useMemo<PerformanceActions>(
    () => ({
      getState,
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
      getState,
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
    <PerformanceActionsContext.Provider value={actions}>
      <PerformanceStateContext.Provider value={state}>
        {children}
      </PerformanceStateContext.Provider>
    </PerformanceActionsContext.Provider>
  );
}
