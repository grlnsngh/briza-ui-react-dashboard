/**
 * usePerformanceContext Hook
 *
 * Accessor for the performance context. Lives in its own module so the provider
 * file exports only a component (see `performanceContextValue.ts`).
 *
 * @example
 * ```tsx
 * import { usePerformanceContext } from '@contexts';
 *
 * function MyComponent() {
 *   const { state, updateComponentMetric } = usePerformanceContext();
 * }
 * ```
 */

import { useContext } from "react";
import { PerformanceContext } from "./performanceContextValue";

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
