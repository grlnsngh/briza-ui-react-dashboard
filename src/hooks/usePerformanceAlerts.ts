/**
 * usePerformanceAlerts Hook
 *
 * Monitors performance metrics and generates alerts
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { usePerformanceContext } from "../contexts";
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

  const { state } = usePerformanceContext();
  const location = useLocation();
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  const thresholds: AlertThresholds = useMemo(
    () => ({
      ...DEFAULT_THRESHOLDS,
      ...customThresholds,
    }),
    [customThresholds]
  );

  const checkAlerts = useCallback(() => {
    if (!enabled) return;

    const newAlerts = getAllAlerts(
      state.componentMetrics,
      state.webVitals,
      thresholds
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
  }, [enabled, state.componentMetrics, state.webVitals, thresholds]);

  useEffect(() => {
    if (!enabled) return;

    // Check immediately
    checkAlerts();

    // Set up interval
    const interval = setInterval(checkAlerts, checkInterval);

    return () => clearInterval(interval);
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
