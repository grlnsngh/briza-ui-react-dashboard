/**
 * Alert Panel Component
 *
 * Slide-out panel that displays all performance alerts
 */

import { useEffect, useRef } from "react";
import type { PerformanceAlert } from "../../../types/alerts";
import styles from "./AlertPanel.module.css";

interface AlertPanelProps {
  alerts: PerformanceAlert[];
  isOpen: boolean;
  onClose: () => void;
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
}

export function AlertPanel({
  alerts,
  isOpen,
  onClose,
  onDismiss,
  onDismissAll,
}: AlertPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const errorAlerts = alerts.filter((a) => a.severity === "error");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Performance alerts"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Performance Alerts</h2>
            <span className={styles.count}>
              {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className={styles.headerActions}>
            {alerts.length > 0 && (
              <button
                className={styles.dismissAllButton}
                onClick={onDismissAll}
                aria-label="Dismiss all alerts"
              >
                Dismiss All
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close panel"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Alert List */}
        <div className={styles.content}>
          {alerts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                className={styles.emptyIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className={styles.emptyTitle}>All Clear!</h3>
              <p className={styles.emptyMessage}>
                No performance issues detected at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Error Alerts */}
              {errorAlerts.length > 0 && (
                <div className={styles.alertSection}>
                  <h3 className={styles.sectionTitle}>
                    <span className={`${styles.severityBadge} ${styles.error}`}>
                      🔴 Errors
                    </span>
                    <span className={styles.sectionCount}>
                      {errorAlerts.length}
                    </span>
                  </h3>
                  <div className={styles.alertList}>
                    {errorAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Alerts */}
              {warningAlerts.length > 0 && (
                <div className={styles.alertSection}>
                  <h3 className={styles.sectionTitle}>
                    <span
                      className={`${styles.severityBadge} ${styles.warning}`}
                    >
                      ⚠️ Warnings
                    </span>
                    <span className={styles.sectionCount}>
                      {warningAlerts.length}
                    </span>
                  </h3>
                  <div className={styles.alertList}>
                    {warningAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Info Alerts */}
              {infoAlerts.length > 0 && (
                <div className={styles.alertSection}>
                  <h3 className={styles.sectionTitle}>
                    <span className={`${styles.severityBadge} ${styles.info}`}>
                      ℹ️ Info
                    </span>
                    <span className={styles.sectionCount}>
                      {infoAlerts.length}
                    </span>
                  </h3>
                  <div className={styles.alertList}>
                    {infoAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={onDismiss}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Alert Card Component
interface AlertCardProps {
  alert: PerformanceAlert;
  onDismiss: (alertId: string) => void;
}

function AlertCard({ alert, onDismiss }: AlertCardProps) {
  return (
    <div className={`${styles.alertCard} ${styles[alert.severity]}`}>
      <div className={styles.alertCardContent}>
        <div className={styles.alertCardHeader}>
          <h4 className={styles.alertTitle}>{alert.title}</h4>
          {alert.componentName && (
            <span className={styles.componentName}>{alert.componentName}</span>
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
        <div className={styles.alertFooter}>
          <span className={styles.timestamp}>
            {new Date(alert.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
      <button
        className={styles.dismissButton}
        onClick={() => onDismiss(alert.id)}
        aria-label="Dismiss alert"
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
