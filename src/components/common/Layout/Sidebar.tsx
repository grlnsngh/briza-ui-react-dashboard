/**
 * Sidebar Navigation
 *
 * Two states: expanded with labels, or collapsed to a 56px icon rail. The rail
 * is the reason nav items carry real icons rather than emoji — emoji cannot
 * hold a consistent optical weight at 18px, and a rail of them reads as a
 * sticker sheet.
 *
 * Navigation is grouped because seven flat links have no shape. "Overview"
 * answers how the library is doing; "Analyze" is where you go once you know
 * something is wrong.
 */

import { NavLink } from "react-router-dom";
import { usePerformanceState } from "../../../contexts";
import { ROUTES } from "../../../utils/constants";
import { Icon, type IconName } from "../Icon";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "gauge" },
      { path: ROUTES.SHOWCASE, label: "Component Showcase", icon: "layers" },
    ],
  },
  {
    heading: "Analyze",
    items: [
      {
        path: ROUTES.COMPONENT_MONITOR,
        label: "Component Monitor",
        icon: "activity",
      },
      { path: ROUTES.RERENDER_TRACKER, label: "Re-render Tracker", icon: "repeat" },
      { path: ROUTES.BUNDLE_ANALYZER, label: "Bundle Analyzer", icon: "package" },
      { path: ROUTES.WEB_VITALS, label: "Web Vitals", icon: "bolt" },
      { path: ROUTES.THEME_PERFORMANCE, label: "Theme Performance", icon: "contrast" },
    ],
  },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { componentMetrics, webVitals, dashboard } = usePerformanceState();

  const tracked = componentMetrics.size;
  const avgScore = tracked
    ? Array.from(componentMetrics.values()).reduce(
        (sum, metric) => sum + metric.performanceScore,
        0
      ) / tracked
    : 0;

  const isLive = dashboard.isRealTimeEnabled;

  return (
    <>
      {isOpen && (
        <div className={styles.scrim} onClick={onToggle} aria-hidden="true" />
      )}

      <aside
        className={`${styles.sidebar} ${isOpen ? "" : styles.collapsed}`}
        aria-label="Primary"
      >
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 17.5 8 8.5l4 6 3.5-8.5 5.5 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.wordmark}>
            <span className={styles.wordmarkName}>Briza</span>
            <span className={styles.wordmarkSuffix}>Analytics</span>
          </span>
        </div>

        {/* Status strip. Reads as instrumentation rather than as a card:
            no border, no fill — just a rule and three readings. */}
        <div className={styles.readings}>
          <div className={styles.reading}>
            <span className={styles.readingLabel}>Tracked</span>
            <span className={`${styles.readingValue} tabular`}>{tracked}</span>
          </div>
          <div className={styles.reading}>
            <span className={styles.readingLabel}>Avg score</span>
            <span className={`${styles.readingValue} tabular`}>
              {tracked ? avgScore.toFixed(0) : "—"}
            </span>
          </div>
          <div className={styles.reading}>
            <span className={styles.readingLabel}>Vitals</span>
            <span className={`${styles.readingValue} tabular`}>
              {webVitals && webVitals.overallScore > 0
                ? webVitals.overallScore.toFixed(0)
                : "—"}
            </span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navGroups.map((group) => (
            <div key={group.heading} className={styles.group}>
              <div className={styles.groupHeading}>{group.heading}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.link} ${isActive ? styles.active : ""}`
                  }
                  title={isOpen ? undefined : item.label}
                >
                  <span className={styles.linkIcon}>
                    <Icon name={item.icon} size={17} />
                  </span>
                  <span className={styles.linkLabel}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className={styles.foot}>
          <span
            className={`${styles.state} ${isLive ? styles.stateLive : ""}`}
            title={isLive ? "Monitoring active" : "Monitoring paused"}
          >
            <span className={styles.stateDot} aria-hidden="true" />
            <span className={styles.stateLabel}>
              {isLive ? "Monitoring" : "Paused"}
            </span>
          </span>
          <span className={`${styles.version} tabular`}>v1.0.0</span>
        </div>
      </aside>
    </>
  );
}
