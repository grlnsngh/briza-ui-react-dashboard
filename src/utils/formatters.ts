/**
 * Utility Functions for Briza UI Performance Dashboard
 */

import type { WebVitalMetric, TimeSeriesDataPoint } from "../types/performance";
import { WEB_VITALS_THRESHOLDS } from "./constants";

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}m`;
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date to readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

// =============================================================================
// CALCULATION UTILITIES
// =============================================================================

/**
 * Calculate average of numbers
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
}

/**
 * Calculate median of numbers
 */
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate percentile
 */
export function calculatePercentile(
  numbers: number[],
  percentile: number
): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const avg = calculateAverage(numbers);
  const squareDiffs = numbers.map((num) => Math.pow(num - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate performance score (0-100)
 */
export function calculatePerformanceScore(
  renderTime: number,
  bundleSize: number,
  rerenderCount: number
): number {
  // Weight factors
  const RENDER_WEIGHT = 0.4;
  const BUNDLE_WEIGHT = 0.4;
  const RERENDER_WEIGHT = 0.2;

  // Normalize render time (0-100ms to 100-0 score)
  const renderScore = Math.max(0, 100 - renderTime);

  // Normalize bundle size (0-500KB to 100-0 score)
  const bundleScore = Math.max(0, 100 - bundleSize / 5120);

  // Normalize rerender count (0-10 to 100-0 score)
  const rerenderScore = Math.max(0, 100 - rerenderCount * 10);

  const totalScore =
    renderScore * RENDER_WEIGHT +
    bundleScore * BUNDLE_WEIGHT +
    rerenderScore * RERENDER_WEIGHT;

  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

// =============================================================================
// WEB VITALS UTILITIES
// =============================================================================

/**
 * Get rating for Web Vital metric
 */
export function getWebVitalRating(
  name: WebVitalMetric["name"],
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = WEB_VITALS_THRESHOLDS[name];

  if (!thresholds) return "good";

  if (value <= thresholds.GOOD) return "good";
  if (value <= thresholds.NEEDS_IMPROVEMENT) return "needs-improvement";
  return "poor";
}

/**
 * Calculate overall Web Vitals score
 */
export function calculateWebVitalsScore(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
}): number {
  const scores: number[] = [];

  if (metrics.lcp !== undefined) {
    const lcpScore =
      metrics.lcp <= WEB_VITALS_THRESHOLDS.LCP.GOOD
        ? 100
        : metrics.lcp <= WEB_VITALS_THRESHOLDS.LCP.NEEDS_IMPROVEMENT
        ? 50
        : 0;
    scores.push(lcpScore);
  }

  if (metrics.fid !== undefined) {
    const fidScore =
      metrics.fid <= WEB_VITALS_THRESHOLDS.FID.GOOD
        ? 100
        : metrics.fid <= WEB_VITALS_THRESHOLDS.FID.NEEDS_IMPROVEMENT
        ? 50
        : 0;
    scores.push(fidScore);
  }

  if (metrics.cls !== undefined) {
    const clsScore =
      metrics.cls <= WEB_VITALS_THRESHOLDS.CLS.GOOD
        ? 100
        : metrics.cls <= WEB_VITALS_THRESHOLDS.CLS.NEEDS_IMPROVEMENT
        ? 50
        : 0;
    scores.push(clsScore);
  }

  return scores.length > 0 ? calculateAverage(scores) : 0;
}

// =============================================================================
// DATA TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Group data by time interval
 */
export function groupByTimeInterval(
  data: TimeSeriesDataPoint[],
  intervalMs: number
): TimeSeriesDataPoint[] {
  const grouped = new Map<number, number[]>();

  data.forEach((point) => {
    const bucket = Math.floor(point.timestamp / intervalMs) * intervalMs;
    if (!grouped.has(bucket)) {
      grouped.set(bucket, []);
    }
    grouped.get(bucket)!.push(point.value);
  });

  return Array.from(grouped.entries())
    .map(([timestamp, values]) => ({
      timestamp,
      value: calculateAverage(values),
    }))
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Filter data by time range
 */
export function filterByTimeRange(
  data: TimeSeriesDataPoint[],
  range: "1h" | "24h" | "7d" | "30d" | "all"
): TimeSeriesDataPoint[] {
  if (range === "all") return data;

  const now = Date.now();
  const rangeMs = {
    "1h": 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }[range];

  const cutoff = now - rangeMs;
  return data.filter((point) => point.timestamp >= cutoff);
}

// =============================================================================
// COLOR UTILITIES
// =============================================================================

/**
 * Get color based on performance score
 */
export function getScoreColor(score: number): string {
  if (score >= 90) return "#10b981"; // green
  if (score >= 70) return "#f59e0b"; // yellow
  if (score >= 50) return "#f97316"; // orange
  return "#ef4444"; // red
}

/**
 * Get color based on value and thresholds
 */
export function getThresholdColor(
  value: number,
  good: number,
  acceptable: number
): string {
  if (value <= good) return "#10b981";
  if (value <= acceptable) return "#f59e0b";
  return "#ef4444";
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if value is within acceptable range
 */
export function isWithinRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// =============================================================================
// DEBOUNCE & THROTTLE
// =============================================================================

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  waitMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), waitMs);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limitMs: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limitMs);
    }
  };
}

// =============================================================================
// LOCAL STORAGE UTILITIES
// =============================================================================

/**
 * Safely get item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Get unique values from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sort array by property
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
}
