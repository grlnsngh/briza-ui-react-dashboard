/**
 * Re-render Tracker Page
 *
 * Tracks and visualizes component re-renders in real-time.
 * Helps identify unnecessary re-renders and performance bottlenecks.
 */

import { useState, useMemo } from "react";
import { usePerformanceContext } from "../contexts";
import { formatDuration, formatNumber } from "../utils/formatters";
import {
  PerformanceLineChart,
  PerformanceBarChart,
} from "../components/charts";
import styles from "./RerenderTracker.module.css";

export default function RerenderTracker() {
  const { state } = usePerformanceContext();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [showOnlyProblematic, setShowOnlyProblematic] = useState(false);

  // Convert componentMetrics to array with render data
  const components = useMemo(() => {
    return Array.from(state.componentMetrics.entries()).map(
      ([name, metrics]) => ({
        name,
        renderCount: metrics.renderCount,
        avgRenderTime: metrics.avgRenderTime,
        lastRenderTime: metrics.lastRenderTime,
        totalRenderTime: metrics.totalRenderTime,
        renderHistory: metrics.renderHistory,
        // Detect problematic components (high render count with slow renders)
        isProblematic: metrics.renderCount > 10 && metrics.avgRenderTime > 10,
      })
    );
  }, [state.componentMetrics]);

  // Filter problematic components if enabled
  const displayedComponents = useMemo(() => {
    if (showOnlyProblematic) {
      return components.filter((c) => c.isProblematic);
    }
    return components;
  }, [components, showOnlyProblematic]);

  // Sort by render count (descending)
  const sortedComponents = useMemo(() => {
    return [...displayedComponents].sort(
      (a, b) => b.renderCount - a.renderCount
    );
  }, [displayedComponents]);

  // Top 10 most rendered components for chart
  const topRenderedData = useMemo(() => {
    return sortedComponents.slice(0, 10).map((c) => ({
      name: c.name,
      "Render Count": c.renderCount,
      "Avg Time (ms)": c.avgRenderTime,
    }));
  }, [sortedComponents]);

  // Selected component render timeline
  const renderTimelineData = useMemo(() => {
    if (!selectedComponent) return null;
    const component = components.find((c) => c.name === selectedComponent);
    if (!component || !component.renderHistory.length) return null;

    return component.renderHistory.slice(-50).map((measurement, index) => ({
      timestamp: Date.now() - (component.renderHistory.length - index) * 1000,
      renderTime: measurement.duration,
    }));
  }, [selectedComponent, components]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
    const problematicCount = components.filter((c) => c.isProblematic).length;
    const avgRenderTime =
      components.reduce((sum, c) => sum + c.avgRenderTime, 0) /
        components.length || 0;

    return {
      totalRenders,
      problematicCount,
      avgRenderTime,
      componentsTracked: components.length,
    };
  }, [components]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Re-render Tracker</h1>
          <p className={styles.subtitle}>
            Monitor and optimize component re-renders
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Renders</div>
            <div className={styles.statValue}>
              {formatNumber(stats.totalRenders)}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Components</div>
            <div className={styles.statValue}>{stats.componentsTracked}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Problematic</div>
            <div
              className={styles.statValue}
              style={{
                color:
                  stats.problematicCount > 0
                    ? "var(--color-warning)"
                    : "var(--color-success)",
              }}
            >
              {stats.problematicCount}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={showOnlyProblematic}
            onChange={(e) => setShowOnlyProblematic(e.target.checked)}
          />
          <span>Show only problematic components</span>
        </label>
      </div>

      {/* Charts */}
      {sortedComponents.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Top 10 Most Re-rendered Components
            </h3>
            <PerformanceBarChart
              data={topRenderedData}
              bars={[
                { dataKey: "Render Count", name: "Renders", color: "#3b82f6" },
              ]}
              height={300}
              yAxisLabel="Render Count"
            />
          </div>

          {renderTimelineData && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                Render Timeline: {selectedComponent}
              </h3>
              <PerformanceLineChart
                data={renderTimelineData}
                lines={[
                  {
                    dataKey: "renderTime",
                    name: "Render Time (ms)",
                    color: "#f59e0b",
                  },
                ]}
                height={300}
                yAxisLabel="Time (ms)"
              />
            </div>
          )}
        </div>
      )}

      {/* Component Table */}
      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Component Re-render Details</h3>

        {sortedComponents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>🔄</div>
            <div className={styles.emptyStateText}>
              {showOnlyProblematic
                ? "No problematic components detected"
                : "No components monitored yet"}
            </div>
            <div className={styles.emptyStateSubtext}>
              {showOnlyProblematic
                ? "All components are performing well!"
                : "Start using components to track re-renders"}
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Render Count</th>
                  <th>Avg Time</th>
                  <th>Last Render</th>
                  <th>Total Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedComponents.map((component) => (
                  <tr
                    key={component.name}
                    className={`${
                      selectedComponent === component.name
                        ? styles.selectedRow
                        : ""
                    } ${component.isProblematic ? styles.problematicRow : ""}`}
                  >
                    <td className={styles.componentName}>
                      {component.name}
                      {component.isProblematic && (
                        <span className={styles.warningBadge}>⚠</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.renderCount}>
                        {formatNumber(component.renderCount)}
                      </span>
                    </td>
                    <td>{formatDuration(component.avgRenderTime)}</td>
                    <td>{formatDuration(component.lastRenderTime)}</td>
                    <td>{formatDuration(component.totalRenderTime)}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          component.isProblematic ? styles.warning : styles.good
                        }`}
                      >
                        {component.isProblematic ? "Needs Attention" : "Good"}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => setSelectedComponent(component.name)}
                      >
                        View Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Optimization Tips */}
      <div className={styles.tipsSection}>
        <h2 className={styles.sectionTitle}>Optimization Tips</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>💡</div>
            <h3 className={styles.tipTitle}>Use React.memo</h3>
            <p className={styles.tipDescription}>
              Wrap components in React.memo to prevent unnecessary re-renders
              when props haven't changed.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>🎯</div>
            <h3 className={styles.tipTitle}>useMemo & useCallback</h3>
            <p className={styles.tipDescription}>
              Memoize expensive computations and callback functions to maintain
              referential equality.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>📦</div>
            <h3 className={styles.tipTitle}>Code Splitting</h3>
            <p className={styles.tipDescription}>
              Split large components into smaller ones and use lazy loading to
              improve initial load time.
            </p>
          </div>
          <div className={styles.tipCard}>
            <div className={styles.tipIcon}>⚡</div>
            <h3 className={styles.tipTitle}>Context Optimization</h3>
            <p className={styles.tipDescription}>
              Split contexts by update frequency and use multiple small contexts
              instead of one large one.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
