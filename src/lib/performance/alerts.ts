/**
 * Performance Alert Service
 *
 * Monitors performance metrics and generates alerts when thresholds are exceeded.
 */

import type {
  ComponentPerformanceMetrics,
  WebVitalsData,
} from "../../types/performance";
import type {
  PerformanceAlert,
  AlertThresholds,
  AlertSeverity,
  AlertType,
} from "../../types/alerts";
import { DEFAULT_THRESHOLDS } from "../../types/alerts";

/**
 * Generate a stable alert ID based on alert characteristics
 * This ensures the same issue doesn't create multiple alerts
 */
function generateAlertId(
  type: AlertType,
  componentName?: string,
  metric?: string
): string {
  const parts: string[] = [type];
  if (componentName) parts.push(componentName);
  if (metric) parts.push(metric);
  return parts.join("-");
}

function createAlert(
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  options?: {
    componentName?: string;
    metric?: string;
    value?: number;
    threshold?: number;
  }
): PerformanceAlert {
  return {
    id: generateAlertId(type, options?.componentName, options?.metric),
    type,
    severity,
    title,
    message,
    componentName: options?.componentName,
    metric: options?.metric,
    value: options?.value,
    threshold: options?.threshold,
    timestamp: Date.now(),
    dismissed: false,
  };
}

/**
 * Check component metrics for performance issues
 */
export function checkComponentMetrics(
  metrics: ComponentPerformanceMetrics,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  // Check for slow renders
  if (metrics.lastRenderTime > thresholds.maxRenderTime) {
    alerts.push(
      createAlert(
        "slow-render",
        metrics.lastRenderTime > thresholds.maxRenderTime * 2
          ? "error"
          : "warning",
        "Slow Render Detected",
        `Component "${
          metrics.componentName
        }" took ${metrics.lastRenderTime.toFixed(
          2
        )}ms to render, exceeding the ${thresholds.maxRenderTime}ms threshold.`,
        {
          componentName: metrics.componentName,
          metric: "renderTime",
          value: metrics.lastRenderTime,
          threshold: thresholds.maxRenderTime,
        }
      )
    );
  }

  // Check average render time
  if (metrics.avgRenderTime > thresholds.maxRenderTime * 0.8) {
    alerts.push(
      createAlert(
        "slow-render",
        "warning",
        "Consistently Slow Renders",
        `Component "${
          metrics.componentName
        }" has an average render time of ${metrics.avgRenderTime.toFixed(
          2
        )}ms. Consider optimizing with React.memo or useMemo.`,
        {
          componentName: metrics.componentName,
          metric: "avgRenderTime",
          value: metrics.avgRenderTime,
          threshold: thresholds.maxRenderTime,
        }
      )
    );
  }

  // Check for excessive re-renders
  const recentRenders = metrics.renderHistory.filter(
    (r) => r.timestamp > Date.now() - 1000
  );
  if (recentRenders.length > thresholds.maxRendersPerSecond) {
    alerts.push(
      createAlert(
        "excessive-rerenders",
        "error",
        "Excessive Re-renders",
        `Component "${metrics.componentName}" rendered ${recentRenders.length} times in the last second. This may indicate missing dependency arrays or unnecessary state updates.`,
        {
          componentName: metrics.componentName,
          metric: "rendersPerSecond",
          value: recentRenders.length,
          threshold: thresholds.maxRendersPerSecond,
        }
      )
    );
  }

  // Check memory usage - only alert if significantly over threshold
  if (
    metrics.memoryUsage &&
    metrics.memoryUsage > thresholds.memoryGrowthThreshold * 1.5 // 1.5x buffer to reduce false positives
  ) {
    alerts.push(
      createAlert(
        "memory-leak",
        "warning",
        "High Memory Usage",
        `Component "${metrics.componentName}" is using ${(
          metrics.memoryUsage /
          1024 /
          1024
        ).toFixed(2)}MB of memory (threshold: ${(
          thresholds.memoryGrowthThreshold /
          1024 /
          1024
        ).toFixed(
          0
        )}MB). Monitor for potential memory leaks or optimize large data structures if memory continues to grow.`,
        {
          componentName: metrics.componentName,
          metric: "memoryUsage",
          value: metrics.memoryUsage,
          threshold: thresholds.memoryGrowthThreshold,
        }
      )
    );
  }

  // Check performance score
  if (metrics.performanceScore < 50) {
    alerts.push(
      createAlert(
        "slow-render",
        "error",
        "Poor Performance Score",
        `Component "${metrics.componentName}" has a performance score of ${metrics.performanceScore}/100. Consider optimization strategies.`,
        {
          componentName: metrics.componentName,
          metric: "performanceScore",
          value: metrics.performanceScore,
          threshold: 50,
        }
      )
    );
  }

  return alerts;
}

/**
 * Check Web Vitals for issues
 */
export function checkWebVitals(
  vitals: WebVitalsData,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  if (vitals.overallScore < thresholds.minWebVitalsScore) {
    alerts.push(
      createAlert(
        "poor-web-vitals",
        vitals.overallScore < 50 ? "error" : "warning",
        "Poor Web Vitals Score",
        `Your overall Web Vitals score is ${vitals.overallScore}/100. This may impact user experience and SEO.`,
        {
          metric: "webVitalsScore",
          value: vitals.overallScore,
          threshold: thresholds.minWebVitalsScore,
        }
      )
    );
  }

  // Check individual metrics
  if (vitals.lcp && vitals.lcp.value > 2500) {
    alerts.push(
      createAlert(
        "poor-web-vitals",
        vitals.lcp.value > 4000 ? "error" : "warning",
        "Slow Largest Contentful Paint",
        `LCP is ${(vitals.lcp.value / 1000).toFixed(
          2
        )}s. Target is <2.5s for good user experience.`,
        {
          metric: "LCP",
          value: vitals.lcp.value,
          threshold: 2500,
        }
      )
    );
  }

  if (vitals.fid && vitals.fid.value > 100) {
    alerts.push(
      createAlert(
        "poor-web-vitals",
        vitals.fid.value > 300 ? "error" : "warning",
        "Slow First Input Delay",
        `FID is ${vitals.fid.value}ms. Target is <100ms for responsive interactions.`,
        {
          metric: "FID",
          value: vitals.fid.value,
          threshold: 100,
        }
      )
    );
  }

  if (vitals.cls && vitals.cls.value > 0.1) {
    alerts.push(
      createAlert(
        "poor-web-vitals",
        vitals.cls.value > 0.25 ? "error" : "warning",
        "High Cumulative Layout Shift",
        `CLS is ${vitals.cls.value.toFixed(
          3
        )}. Target is <0.1 for stable layouts.`,
        {
          metric: "CLS",
          value: vitals.cls.value,
          threshold: 0.1,
        }
      )
    );
  }

  return alerts;
}

/**
 * Get all current alerts for the application
 */
export function getAllAlerts(
  componentMetrics: Map<string, ComponentPerformanceMetrics>,
  webVitals: WebVitalsData | null,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  // Check all component metrics
  componentMetrics.forEach((metrics) => {
    const componentAlerts = checkComponentMetrics(metrics, thresholds);
    alerts.push(...componentAlerts);
  });

  // Check web vitals
  if (webVitals) {
    const vitalAlerts = checkWebVitals(webVitals, thresholds);
    alerts.push(...vitalAlerts);
  }

  // Sort by severity and timestamp
  return alerts.sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    return b.timestamp - a.timestamp;
  });
}
