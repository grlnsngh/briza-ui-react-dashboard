/**
 * withPerformanceMonitoring HOC
 *
 * Wraps a component in `<MonitoredComponent>` so its renders are captured by
 * the React Profiler. Kept in its own module so `MonitoredComponent.tsx` exports
 * only a component and stays eligible for React Fast Refresh.
 *
 * @example
 * ```tsx
 * const MonitoredButton = withPerformanceMonitoring(Button);
 * ```
 */

import type { ComponentType } from "react";
import { MonitoredComponent } from "./MonitoredComponent";

export function withPerformanceMonitoring<P extends object>(
  Component: ComponentType<P>,
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
