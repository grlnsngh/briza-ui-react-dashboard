/**
 * usePerformanceAlerts Hook
 *
 * Monitors performance metrics and generates alerts
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { usePerformanceActions } from "../contexts";
import { getAllAlerts } from "../lib/performance/alerts";
import type { PerformanceAlert, AlertThresholds } from "../types/alerts";
import { DEFAULT_THRESHOLDS } from "../types/alerts";

interface UsePerformanceAlertsOptions {
  /** Custom alert thresholds */
  thresholds?: Partial<AlertThresholds>;
  /** Check interval in milliseconds */
  checkInterval?: number;
  /** Enable alerts */
  enabled?: boolean;
}

export function usePerformanceAlerts(
  options: UsePerformanceAlertsOptions = {}
) {
  const {
    thresholds: customThresholds,
    checkInterval = 10000, // Check every 10 seconds (increased from 5s to reduce overhead)
    enabled = true,
  } = options;

  // Actions only. Alerts are recomputed on a timer, so subscribing to the
  // metrics here would re-render Layout — and with it the whole route tree —
  // on every measurement, purely to keep a value this hook reads on a schedule.
  const { getState } = usePerformanceActions();
  const location = useLocation();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const thresholds: AlertThresholds = useMemo(
    () => ({
      ...DEFAULT_THRESHOLDS,
      ...customThresholds,
    }),
    [customThresholds]
  );

  // Latest options for the interval below, read through a ref so that
  // `checkAlerts` stays referentially stable.
  const optionsRef = useRef({ thresholds, enabled, getState });
  optionsRef.current = { thresholds, enabled, getState };

  const checkAlerts = useCallback(() => {
    const {
      thresholds: latestThresholds,
      enabled: isEnabled,
      getState: readState,
    } = optionsRef.current;

    if (!isEnabled) return;

    const { componentMetrics, webVitals } = readState();
    const newAlerts = getAllAlerts(
      componentMetrics,
      webVitals,
      latestThresholds
    );

    setAlerts((prev) => {
      // Create a map of dismissed alerts by ID
      const dismissedMap = new Map(
        prev.filter((a) => a.dismissed).map((a) => [a.id, a])
      );

      // Create a map of existing alerts by ID to preserve timestamps
      const existingMap = new Map(prev.map((a) => [a.id, a]));

      // Deduplicate and merge with existing state
      const alertMap = new Map<string, PerformanceAlert>();

      newAlerts.forEach((alert) => {
        // Skip if already dismissed
        if (dismissedMap.has(alert.id)) {
          alertMap.set(alert.id, { ...alert, dismissed: true });
          return;
        }

        // Preserve original timestamp if alert already exists
        const existing = existingMap.get(alert.id);
        if (existing) {
          alertMap.set(alert.id, {
            ...alert,
            timestamp: existing.timestamp,
          });
        } else {
          alertMap.set(alert.id, alert);
        }
      });

      return Array.from(alertMap.values());
    });
  }, []);

  // `checkAlerts` used to depend on the metrics it reads, so this effect was
  // torn down and rebuilt on every measurement: the interval never survived
  // long enough to fire, and the immediate check below ran on every update
  // instead — the opposite of the overhead reduction `checkInterval` promises.
  // With a stable `checkAlerts` the timer is armed once per enable/interval.
  useEffect(() => {
    if (!enabled) return;

    // Seed once on arm, so the panel is not blank for a full interval.
    checkAlerts();

    const interval = window.setInterval(checkAlerts, checkInterval);

    return () => window.clearInterval(interval);
  }, [checkAlerts, checkInterval, enabled]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, dismissed: true })));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const clearDismissed = useCallback(() => {
    setAlerts((prev) => prev.filter((alert) => !alert.dismissed));
  }, []);

  // Auto-clear dismissed alerts when navigating to a different page
  useEffect(() => {
    clearDismissed();
  }, [location.pathname, clearDismissed]);

  return {
    alerts,
    activeAlerts: alerts.filter((a) => !a.dismissed),
    dismissAlert,
    dismissAll,
    clearAlerts,
    clearDismissed,
    checkAlerts,
  };
}
