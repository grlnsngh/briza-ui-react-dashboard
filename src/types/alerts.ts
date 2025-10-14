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
  /** Memory usage threshold in bytes - triggers warning when component exceeds this (default: 50MB - normal for modern React apps is 20-100MB) */
  memoryGrowthThreshold: number;
  /** Maximum bundle size in bytes (default: 500KB) */
  maxBundleSize: number;
  /** Minimum acceptable Web Vitals scores */
  minWebVitalsScore: number;
}

export const DEFAULT_THRESHOLDS: AlertThresholds = {
  maxRenderTime: 16,
  maxRendersPerSecond: 20,
  memoryGrowthThreshold: 50 * 1024 * 1024, // 50MB (realistic for modern React apps)
  maxBundleSize: 500 * 1024, // 500KB
  minWebVitalsScore: 70,
};
