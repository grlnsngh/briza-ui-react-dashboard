/**
 * Performance Alert Component
 *
 * Displays performance alerts as toast notifications.
 */

import { useState, useEffect } from "react";
import type { PerformanceAlert } from "../../../types/alerts";
import styles from "./PerformanceAlerts.module.css";

interface PerformanceAlertsProps {
  alerts: PerformanceAlert[];
  onDismiss: (alertId: string) => void;
  onDismissAll?: () => void;
  maxVisible?: number;
}

export function PerformanceAlerts({
  alerts,
  onDismiss,
  onDismissAll,
  maxVisible = 5,
}: PerformanceAlertsProps) {
  const [visibleAlerts, setVisibleAlerts] = useState<PerformanceAlert[]>([]);
  const [exitingAlerts, setExitingAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show only undismissed alerts, limited by maxVisible
    const undismissed = alerts
      .filter((alert) => !alert.dismissed)
      .slice(0, maxVisible);
    setVisibleAlerts(undismissed);
  }, [alerts, maxVisible]);

  const handleDismiss = (alertId: string) => {
    // Start exit animation
    setExitingAlerts((prev) => new Set(prev).add(alertId));

    // Wait for animation to complete before calling onDismiss
    setTimeout(() => {
      onDismiss(alertId);
      setExitingAlerts((prev) => {
        const next = new Set(prev);
        next.delete(alertId);
        return next;
      });
    }, 300);
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div
      className={styles.alertContainer}
      role="region"
      aria-label="Performance alerts"
    >
      {visibleAlerts.length > 1 && onDismissAll && (
        <div className={styles.alertHeader}>
          <span className={styles.alertCount}>
            {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? "s" : ""}
          </span>
          <button
            className={styles.dismissAllButton}
            onClick={onDismissAll}
            aria-label="Dismiss all alerts"
          >
            Dismiss All
          </button>
        </div>
      )}
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`${styles.alert} ${styles[alert.severity]} ${
            exitingAlerts.has(alert.id) ? styles.exiting : ""
          }`}
          role="alert"
          aria-live="polite"
        >
          <div className={styles.alertIcon}>
            {alert.severity === "error" && "🔴"}
            {alert.severity === "warning" && "⚠️"}
            {alert.severity === "info" && "ℹ️"}
          </div>

          <div className={styles.alertContent}>
            <div className={styles.alertHeader}>
              <h4 className={styles.alertTitle}>{alert.title}</h4>
              {alert.componentName && (
                <span className={styles.alertComponent}>
                  {alert.componentName}
                </span>
              )}
            </div>
            <p className={styles.alertMessage}>{alert.message}</p>
            {alert.value !== undefined && alert.threshold !== undefined && (
              <div className={styles.alertMetrics}>
                <span className={styles.metricLabel}>{alert.metric}:</span>
                <span className={styles.metricValue}>
                  {typeof alert.value === "number"
                    ? alert.value.toFixed(2)
                    : alert.value}
                </span>
                <span className={styles.metricThreshold}>
                  (threshold: {alert.threshold})
                </span>
              </div>
            )}
          </div>

          <button
            className={styles.dismissButton}
            onClick={() => handleDismiss(alert.id)}
            aria-label="Dismiss alert"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
