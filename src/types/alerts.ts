/**
 * Performance Alert Types
 */

export type AlertSeverity = "info" | "warning" | "error";
export type AlertType =
  | "slow-render"
  | "excessive-rerenders"
  | "memory-leak"
  | "large-bundle"
  | "poor-web-vitals";

export interface PerformanceAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  componentName?: string;
  metric?: string;
  value?: number;
  threshold?: number;
  timestamp: number;
  dismissed?: boolean;
}

export interface AlertThresholds {
  /** Maximum acceptable render time in ms (default: 16ms for 60fps) */
  maxRenderTime: number;
  /** Maximum renders per second (default: 20) */
  maxRendersPerSecond: number;
  /** Memory growth threshold in bytes (default: 10MB) */
  memoryGrowthThreshold: number;
  /** Maximum bundle size in bytes (default: 500KB) */
  maxBundleSize: number;
  /** Minimum acceptable Web Vitals scores */
  minWebVitalsScore: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  maxRenderTime: 16,
  maxRendersPerSecond: 20,
  memoryGrowthThreshold: 10 * 1024 * 1024, // 10MB
  maxBundleSize: 500 * 1024, // 500KB
  minWebVitalsScore: 70,
};
