/**
 * Demo Mode Toggle Component
 *
 * Allows users to switch between real monitoring data and mock/demo data.
 * Useful for testing, demos, and when no components are being monitored.
 *
 * Features:
 * - Toggle between Live and Demo modes
 * - Visual indicator showing current mode
 * - Automatically loads mock data when enabled
 * - Persists state across sessions
 *
 * @example
 * ```tsx
 * import { DemoModeToggle } from '@components/common';
 *
 * function Header() {
 *   return (
 *     <div className={styles.header}>
 *       <DemoModeToggle />
 *     </div>
 *   );
 * }
 * ```
 */

import { usePerformanceContext } from "../../../contexts";
import { generateMockComponentData } from "../../../utils/mockData";
import styles from "./DemoModeToggle.module.css";

export function DemoModeToggle() {
  const { state, loadMockData, toggleDemoMode, clearMetrics } =
    usePerformanceContext();

  const handleToggle = () => {
    const newMode = !state.isDemoMode;
    toggleDemoMode(newMode);

    if (newMode) {
      // Load mock data when enabling demo mode
      const mockData = generateMockComponentData();
      loadMockData(mockData);
    } else {
      // Clear metrics when disabling demo mode
      clearMetrics();
    }
  };

  return (
    <button
      className={`${styles.toggle} ${state.isDemoMode ? styles.active : ""}`}
      onClick={handleToggle}
      aria-label={`Switch to ${state.isDemoMode ? "Live" : "Demo"} Mode`}
      aria-pressed={state.isDemoMode}
      title={
        state.isDemoMode
          ? "Currently in Demo Mode with mock data. Click to switch to Live Mode."
          : "Currently in Live Mode with real monitoring. Click to switch to Demo Mode."
      }
    >
      <span className={styles.icon}>{state.isDemoMode ? "🎭" : "🔴"}</span>
      <span className={styles.label}>
        {state.isDemoMode ? "Demo Mode" : "Live Mode"}
      </span>
      {state.isDemoMode && (
        <span className={styles.badge} title="Using mock data">
          Mock Data
        </span>
      )}
    </button>
  );
}
