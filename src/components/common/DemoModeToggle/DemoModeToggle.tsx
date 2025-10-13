/**
 * Demo Mode Toggle Component
 *
 * Floating button to enable/disable demo mode with mock data
 */

import { useState } from "react";
import { usePerformanceContext } from "../../../contexts";
import {
  getFullMockDataset,
  generateProblematicComponents,
} from "../../../utils";
import styles from "./DemoModeToggle.module.css";

export default function DemoModeToggle() {
  const { state, loadMockData, toggleDemoMode, clearMetrics } =
    usePerformanceContext();
  const [showMenu, setShowMenu] = useState(false);

  const handleLoadNormalData = () => {
    const mockData = getFullMockDataset();
    loadMockData(mockData);
    setShowMenu(false);
  };

  const handleLoadProblematicData = () => {
    const problematic = generateProblematicComponents();
    loadMockData(problematic);
    setShowMenu(false);
  };

  const handleToggleDemoMode = () => {
    if (state.isDemoMode) {
      toggleDemoMode(false);
      clearMetrics();
    } else {
      handleLoadNormalData();
    }
    setShowMenu(false);
  };

  const handleClearData = () => {
    clearMetrics();
    setShowMenu(false);
  };

  const componentCount = state.componentMetrics.size;

  return (
    <div className={styles.container}>
      {state.isDemoMode && (
        <div className={`${styles.badge} ${styles.active}`}>
          <span>⚡</span>
          <span>Demo Mode Active</span>
        </div>
      )}

      <button
        className={`${styles.toggleButton} ${
          state.isDemoMode ? styles.active : ""
        }`}
        onClick={() => setShowMenu(!showMenu)}
        title="Toggle demo mode"
      >
        <span className={styles.icon}>{state.isDemoMode ? "🎭" : "📊"}</span>
        <span>{state.isDemoMode ? "Demo Mode" : "Load Demo Data"}</span>
      </button>

      {showMenu && (
        <div className={styles.dropdown}>
          <div className={styles.stats}>
            <div className={styles.statsRow}>
              <span>Components:</span>
              <strong>{componentCount}</strong>
            </div>
            <div className={styles.statsRow}>
              <span>Mode:</span>
              <strong>{state.isDemoMode ? "Demo" : "Live"}</strong>
            </div>
          </div>

          <div className={styles.divider} />

          <div
            className={styles.dropdownItem}
            onClick={handleLoadNormalData}
            role="button"
            tabIndex={0}
          >
            <span>📦 Load Full Dataset</span>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
              20+ components
            </span>
          </div>

          <div
            className={styles.dropdownItem}
            onClick={handleLoadProblematicData}
            role="button"
            tabIndex={0}
          >
            <span>⚠️ Load Problem Components</span>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
              3 components
            </span>
          </div>

          <div className={styles.divider} />

          <div
            className={styles.dropdownItem}
            onClick={handleToggleDemoMode}
            role="button"
            tabIndex={0}
          >
            <span>
              {state.isDemoMode ? "🔄 Switch to Live" : "🎭 Enable Demo Mode"}
            </span>
          </div>

          {componentCount > 0 && (
            <div
              className={`${styles.dropdownItem} ${styles.danger}`}
              onClick={handleClearData}
              role="button"
              tabIndex={0}
            >
              <span>🗑️ Clear All Data</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
