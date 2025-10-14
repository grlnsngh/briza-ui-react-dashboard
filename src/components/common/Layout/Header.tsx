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
  alertCount?: number;
  onOpenAlerts?: () => void;
}

const routeLabels: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.SHOWCASE]: "Component Showcase",
  [ROUTES.COMPONENT_MONITOR]: "Component Monitor",
  [ROUTES.BUNDLE_ANALYZER]: "Bundle Analyzer",
  [ROUTES.WEB_VITALS]: "Web Vitals",
  [ROUTES.RERENDER_TRACKER]: "Re-render Tracker",
  [ROUTES.THEME_PERFORMANCE]: "Theme Performance",
};

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  alertCount = 0,
  onOpenAlerts,
}: HeaderProps) {
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

        {/* Alert Bell */}
        {onOpenAlerts && (
          <button
            className={`${styles.alertBell} ${
              alertCount === 0 ? styles.noAlerts : ""
            }`}
            onClick={onOpenAlerts}
            aria-label={
              alertCount > 0
                ? `${alertCount} performance alert${
                    alertCount !== 1 ? "s" : ""
                  }`
                : "View performance alerts"
            }
            title={
              alertCount > 0
                ? `${alertCount} performance alert${
                    alertCount !== 1 ? "s" : ""
                  }`
                : "No active alerts"
            }
          >
            <svg
              className={styles.bellIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {alertCount > 0 && (
              <span className={styles.alertBadge}>
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            )}
          </button>
        )}

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
