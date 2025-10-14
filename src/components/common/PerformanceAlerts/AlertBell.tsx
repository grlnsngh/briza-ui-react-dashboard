/**
 * Alert Bell Component
 *
 * Displays a notification bell icon with badge count in the header
 */

import type { PerformanceAlert } from "../../../types/alerts";
import styles from "./AlertBell.module.css";

interface AlertBellProps {
  alerts: PerformanceAlert[];
  onClick: () => void;
}

export function AlertBell({ alerts, onClick }: AlertBellProps) {
  const errorCount = alerts.filter((a) => a.severity === "error").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const totalCount = alerts.length;

  if (totalCount === 0) return null;

  // Determine the highest severity for the bell color
  const highestSeverity =
    errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "info";

  return (
    <button
      className={`${styles.alertBell} ${styles[highestSeverity]}`}
      onClick={onClick}
      aria-label={`${totalCount} performance alert${
        totalCount !== 1 ? "s" : ""
      }`}
      title={`${totalCount} performance alert${totalCount !== 1 ? "s" : ""}`}
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
      <span className={`${styles.badge} ${styles[highestSeverity]}`}>
        {totalCount > 99 ? "99+" : totalCount}
      </span>
      {errorCount > 0 && <span className={styles.pulse} />}
    </button>
  );
}
