/**
 * Alert Panel Component
 *
 * Slide-out panel that displays all performance alerts
 */

import { useEffect, useRef, useState } from "react";
import type { PerformanceAlert } from "../../../types/alerts";
import styles from "./AlertPanel.module.css";

interface AlertPanelProps {
  alerts: PerformanceAlert[];
  isOpen: boolean;
  onClose: () => void;
  onDismiss: (alertId: string) => void;
  onDismissAll: () => void;
  onClearDismissed?: () => void;
}

export function AlertPanel({
  alerts,
  isOpen,
  onClose,
  onDismiss,
  onDismissAll,
  onClearDismissed,
}: AlertPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showDismissed, setShowDismissed] = useState(false);

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

  // Filter alerts based on showDismissed toggle
  const visibleAlerts = showDismissed
    ? alerts
    : alerts.filter((a) => !a.dismissed);

  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const dismissedCount = alerts.length - activeAlerts.length;

  const errorAlerts = visibleAlerts.filter((a) => a.severity === "error");
  const warningAlerts = visibleAlerts.filter((a) => a.severity === "warning");
  const infoAlerts = visibleAlerts.filter((a) => a.severity === "info");

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
              {activeAlerts.length} active
              {dismissedCount > 0 && (
                <span className={styles.dismissedCount}>
                  {" "}
                  · {dismissedCount} dismissed
                </span>
              )}
            </span>
          </div>
          <div className={styles.headerActions}>
            {activeAlerts.length > 0 && (
              <button
                className={styles.dismissAllButton}
                onClick={onDismissAll}
                aria-label="Dismiss all alerts"
              >
                Dismiss All
              </button>
            )}
            {dismissedCount > 0 && onClearDismissed && (
              <button
                className={styles.clearDismissedButton}
                onClick={onClearDismissed}
                aria-label="Clear dismissed alerts history"
                title="Remove all dismissed alerts from history"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ marginRight: "0.5rem" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear History ({dismissedCount})
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

        {/* Filter Toggle */}
        {dismissedCount > 0 && (
          <div className={styles.filterBar}>
            <button
              className={`${styles.filterButton} ${
                showDismissed ? styles.active : ""
              }`}
              onClick={() => setShowDismissed(!showDismissed)}
              aria-label={
                showDismissed
                  ? "Hide dismissed alerts"
                  : "Show dismissed alerts"
              }
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {showDismissed ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                )}
              </svg>
              <span>
                {showDismissed ? "Hide" : "Show"} dismissed ({dismissedCount})
              </span>
            </button>
          </div>
        )}

        {/* Alert List */}
        <div className={styles.content}>
          {visibleAlerts.length === 0 ? (
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
              <h3 className={styles.emptyTitle}>
                {activeAlerts.length === 0 ? "All Clear!" : "No Alerts to Show"}
              </h3>
              <p className={styles.emptyMessage}>
                {activeAlerts.length === 0
                  ? "No performance issues detected. Your application is running smoothly!"
                  : dismissedCount > 0 && !showDismissed
                  ? `All active alerts dismissed. Click "Show dismissed" above to review ${dismissedCount} dismissed alert${
                      dismissedCount !== 1 ? "s" : ""
                    }.`
                  : "No alerts match the current filter."}
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
    <div
      className={`${styles.alertCard} ${styles[alert.severity]} ${
        alert.dismissed ? styles.dismissed : ""
      }`}
    >
      <div className={styles.alertCardContent}>
        <div className={styles.alertCardHeader}>
          <h4 className={styles.alertTitle}>
            {alert.title}
            {alert.dismissed && (
              <span className={styles.dismissedLabel}>(Dismissed)</span>
            )}
          </h4>
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
      {!alert.dismissed && (
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
      )}
    </div>
  );
}
