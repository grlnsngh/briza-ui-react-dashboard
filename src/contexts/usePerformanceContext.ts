/**
 * Performance Context Accessors
 *
 * Live in their own module so the provider file exports only a component
 * (see `performanceContextValue.ts`).
 *
 * Pick the narrowest hook that does the job:
 *
 * - `usePerformanceActions()` — writers and selectors only. Stable, so the
 *   caller does not re-render when metrics change. Use this anywhere on the
 *   measurement path; a component that re-renders on every measurement it
 *   records is measuring itself.
 * - `usePerformanceState()` — the state object. Re-renders on every update.
 * - `usePerformanceContext()` — both, for components that render state and
 *   dispatch from the same place.
 *
 * @example
 * ```tsx
 * import { usePerformanceActions } from '@contexts';
 *
 * function MyProbe() {
 *   const { updateComponentMetric } = usePerformanceActions();
 * }
 * ```
 */

import { useContext, useMemo } from "react";
import {
  PerformanceActionsContext,
  PerformanceStateContext,
  type PerformanceActions,
  type PerformanceContextValue,
  type PerformanceState,
} from "./performanceContextValue";

/**
 * Hook to access the performance actions. Does not subscribe to state.
 *
 * @throws Error if used outside of PerformanceProvider
 */
export function usePerformanceActions(): PerformanceActions {
  const actions = useContext(PerformanceActionsContext);

  if (actions === undefined) {
    throw new Error(
      "usePerformanceActions must be used within a PerformanceProvider"
    );
  }

  return actions;
}

/**
 * Hook to access the performance state. Re-renders on every measurement.
 *
 * @throws Error if used outside of PerformanceProvider
 */
export function usePerformanceState(): PerformanceState {
  const state = useContext(PerformanceStateContext);

  if (state === undefined) {
    throw new Error(
      "usePerformanceState must be used within a PerformanceProvider"
    );
  }

  return state;
}

/**
 * Hook to access state and actions together.
 *
 * @throws Error if used outside of PerformanceProvider
 */
export function usePerformanceContext(): PerformanceContextValue {
  const state = usePerformanceState();
  const actions = usePerformanceActions();

  return useMemo(() => ({ state, ...actions }), [state, actions]);
}
