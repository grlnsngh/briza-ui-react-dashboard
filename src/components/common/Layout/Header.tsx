/**
 * Header Component
 *
 * Top navigation bar with breadcrumbs, theme toggle, and monitoring controls.
 * Responsive design with mobile menu toggle.
 */

import { useLocation } from "react-router-dom";
import { usePerformanceContext } from "../../../contexts";
import { ROUTES } from "../../../utils/constants";
import styles from "./Header.module.css";

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const routeLabels: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.COMPONENT_MONITOR]: "Component Monitor",
  [ROUTES.BUNDLE_ANALYZER]: "Bundle Analyzer",
  [ROUTES.WEB_VITALS]: "Web Vitals",
  [ROUTES.RERENDER_TRACKER]: "Re-render Tracker",
  [ROUTES.THEME_PERFORMANCE]: "Theme Performance",
};

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const location = useLocation();
  const { state, toggleRealtime } = usePerformanceContext();

  const currentRoute = location.pathname;
  const pageTitle = routeLabels[currentRoute] || "Dashboard";

  const handleToggleMonitoring = () => {
    toggleRealtime(!state.dashboard.isRealTimeEnabled);
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {/* Mobile Menu Toggle */}
        <button
          className={styles.menuToggle}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbHome}>Home</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
        </div>
      </div>

      <div className={styles.right}>
        {/* Real-time Monitoring Toggle */}
        <div className={styles.monitoringToggle}>
          <button
            className={`${styles.toggleButton} ${
              state.dashboard.isRealTimeEnabled ? styles.active : ""
            }`}
            onClick={handleToggleMonitoring}
            title={
              state.dashboard.isRealTimeEnabled
                ? "Disable real-time monitoring"
                : "Enable real-time monitoring"
            }
          >
            <span className={styles.toggleIcon}>
              {state.dashboard.isRealTimeEnabled ? "●" : "○"}
            </span>
            <span className={styles.toggleLabel}>
              {state.dashboard.isRealTimeEnabled ? "Monitoring" : "Paused"}
            </span>
          </button>
        </div>

        {/* Theme Toggle (Future) */}
        <button
          className={styles.themeToggle}
          title="Toggle theme"
          onClick={() => {
            // Will implement with briza-ui ThemeProvider
            const root = document.documentElement;
            const currentTheme = root.getAttribute("data-theme");
            root.setAttribute(
              "data-theme",
              currentTheme === "dark" ? "light" : "dark"
            );
          }}
        >
          🌓
        </button>

        {/* Last Update Indicator */}
        <div className={styles.lastUpdate}>
          <span className={styles.updateLabel}>Last update:</span>
          <span className={styles.updateTime}>
            {new Date(state.dashboard.lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </header>
  );
}
