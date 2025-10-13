/**
 * Sidebar Navigation Component
 *
 * Collapsible sidebar with route navigation, icons, and active states.
 * Displays performance monitoring status and quick metrics.
 */

import { NavLink } from "react-router-dom";
import { usePerformanceContext } from "../../../contexts";
import { ROUTES } from "../../../utils/constants";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "📊" },
  { path: ROUTES.SHOWCASE, label: "Component Showcase", icon: "🎭" },
  { path: ROUTES.COMPONENT_MONITOR, label: "Component Monitor", icon: "⚛️" },
  { path: ROUTES.BUNDLE_ANALYZER, label: "Bundle Analyzer", icon: "📦" },
  { path: ROUTES.WEB_VITALS, label: "Web Vitals", icon: "⚡" },
  { path: ROUTES.RERENDER_TRACKER, label: "Re-render Tracker", icon: "🔄" },
  { path: ROUTES.THEME_PERFORMANCE, label: "Theme Performance", icon: "🎨" },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { state } = usePerformanceContext();

  const totalComponents = state.componentMetrics.size;
  const avgScore =
    Array.from(state.componentMetrics.values()).reduce(
      (sum, metric) => sum + metric.performanceScore,
      0
    ) / totalComponents || 0;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className={styles.overlay} onClick={onToggle} />}

      <aside className={`${styles.sidebar} ${!isOpen ? styles.closed : ""}`}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            {isOpen && <span className={styles.logoText}>Briza Analytics</span>}
          </div>
        </div>

        {/* Quick Stats */}
        {isOpen && (
          <div className={styles.quickStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Components</span>
              <span className={styles.statValue}>{totalComponents}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Avg Score</span>
              <span className={styles.statValue}>{avgScore.toFixed(1)}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Status</span>
              <span
                className={`${styles.statusIndicator} ${
                  state.dashboard.isRealTimeEnabled ? styles.active : ""
                }`}
              >
                {state.dashboard.isRealTimeEnabled ? "● Active" : "○ Inactive"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              title={!isOpen ? item.label : undefined}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {isOpen && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          {isOpen && (
            <div className={styles.footerText}>
              <div>Briza UI Dashboard</div>
              <div className={styles.version}>v1.0.0</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
