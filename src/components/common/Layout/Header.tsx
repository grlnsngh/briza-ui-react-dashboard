/**
 * Header
 *
 * A 52px control strip: where you are on the left, what the instrument is
 * doing on the right. It holds no page content — every page owns its own
 * title block, so the header stays the same height on every route.
 *
 * The theme control is a three-way segmented switch (system / light / dark)
 * rather than a toggle, because a two-state toggle silently drops the
 * "follow the OS" option that most users are actually in.
 */

import { useLocation } from "react-router-dom";
import { useTheme } from "briza-ui-react";
import { usePerformanceContext } from "../../../contexts";
import { ROUTES } from "../../../utils/constants";
import { Icon } from "../Icon";
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

type ThemeMode = "system" | "light" | "dark";

const themeOptions: {
  mode: ThemeMode;
  icon: "contrast" | "sun" | "moon";
  label: string;
}[] = [
  { mode: "system", icon: "contrast", label: "Match system" },
  { mode: "light", icon: "sun", label: "Light" },
  { mode: "dark", icon: "moon", label: "Dark" },
];

export default function Header({
  onToggleSidebar,
  sidebarOpen,
  alertCount = 0,
  onOpenAlerts,
}: HeaderProps) {
  const location = useLocation();
  const { state, toggleRealtime } = usePerformanceContext();

  const pageTitle = routeLabels[location.pathname] ?? "Dashboard";
  const isLive = state.dashboard.isRealTimeEnabled;

  // Theme is owned by briza-ui's ThemeProvider, which writes `data-theme` on
  // the document and persists the choice. Setting that attribute here as well
  // would race the provider on every mount and lose — which is exactly what the
  // previous toggle did.
  const { mode, setMode } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.railToggle}
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={sidebarOpen}
        >
          <Icon name="sidebar" size={16} />
        </button>

        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <span className={styles.crumbRoot}>Briza UI</span>
          <Icon name="chevronRight" size={13} className={styles.crumbSep} />
          <span className={styles.crumbCurrent} aria-current="page">
            {pageTitle}
          </span>
        </nav>
      </div>

      <div className={styles.right}>
        {/* Primary control: the one thing that changes what the app is doing. */}
        <button
          className={`${styles.monitor} ${isLive ? styles.monitorLive : ""}`}
          onClick={() => toggleRealtime(!isLive)}
          title={isLive ? "Pause real-time monitoring" : "Resume real-time monitoring"}
        >
          <Icon name={isLive ? "pause" : "play"} size={13} />
          <span className={styles.monitorLabel}>
            {isLive ? "Monitoring" : "Paused"}
          </span>
        </button>

        <div className={styles.divider} aria-hidden="true" />

        <div className={`${styles.clock} tabular`} title="Last metric update">
          <Icon name="clock" size={13} className={styles.clockIcon} />
          {new Date(state.dashboard.lastUpdate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>

        {onOpenAlerts && (
          <button
            className={styles.iconButton}
            onClick={onOpenAlerts}
            aria-label={
              alertCount > 0
                ? `${alertCount} performance alert${alertCount === 1 ? "" : "s"}`
                : "No active alerts"
            }
          >
            <Icon name="bell" size={16} />
            {alertCount > 0 && (
              <span className={`${styles.badge} tabular`}>
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>
        )}

        <div
          className={styles.themeSwitch}
          role="radiogroup"
          aria-label="Colour theme"
        >
          {themeOptions.map((option) => (
            <button
              key={option.mode}
              role="radio"
              aria-checked={mode === option.mode}
              className={`${styles.themeOption} ${
                mode === option.mode ? styles.themeActive : ""
              }`}
              onClick={() => setMode(option.mode)}
              title={option.label}
            >
              <Icon name={option.icon} size={14} />
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
