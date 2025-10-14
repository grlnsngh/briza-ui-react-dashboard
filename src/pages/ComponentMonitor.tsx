/**
 * Component Performance Monitor Page
 *
 * Comprehensive monitoring dashboard for tracking component performance metrics:
 * - Real-time performance data for all monitored components
 * - Render time charts and trends
 * - Memory usage tracking
 * - Performance scores and comparisons
 * - Filtering and search capabilities
 */

import { useState, useMemo } from "react";
import { usePerformanceContext } from "../contexts";
import {
  formatDuration,
  formatBytes,
  formatNumber,
  getScoreColor,
} from "../utils/formatters";
import {
  PerformanceLineChart,
  PerformanceBarChart,
} from "../components/charts";
import { ComponentLoadingIndicator } from "../components/common";
import {
  BRIZA_UI_COMPONENTS_EXPECTED,
  DASHBOARD_COMPONENTS,
} from "../utils/constants";
import styles from "./ComponentMonitor.module.css";

type SortField =
  | "name"
  | "renderCount"
  | "avgRenderTime"
  | "performanceScore"
  | "memoryUsage";
type SortDirection = "asc" | "desc";

export default function ComponentMonitor() {
  const { state } = usePerformanceContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("performanceScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );

  // Convert componentMetrics Map to array, excluding dashboard components
  const components = useMemo(() => {
    return Array.from(state.componentMetrics.entries())
      .filter(
        ([name]) => !(DASHBOARD_COMPONENTS as readonly string[]).includes(name)
      )
      .map(([name, metrics]) => ({
        name,
        ...metrics,
      }));
  }, [state.componentMetrics]);

  // Filter components based on search
  const filteredComponents = useMemo(() => {
    return components.filter((comp) =>
      comp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [components, searchTerm]);

  // Sort components
  const sortedComponents = useMemo(() => {
    const sorted = [...filteredComponents].sort((a, b) => {
      let aValue: number | string = a[sortField] ?? 0;
      let bValue: number | string = b[sortField] ?? 0;

      if (sortField === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredComponents, sortField, sortDirection]);

  // Prepare chart data
  const barChartData = useMemo(() => {
    return sortedComponents.slice(0, 10).map((comp) => ({
      name: comp.name,
      "Avg Render Time": comp.avgRenderTime,
      "Performance Score": comp.performanceScore,
    }));
  }, [sortedComponents]);

  // Get selected component details
  const selectedComponentData = useMemo(() => {
    if (!selectedComponent) return null;
    const component = components.find((c) => c.name === selectedComponent);
    if (!component || !component.renderHistory.length) return null;

    return component.renderHistory.map((measurement, index) => ({
      timestamp: Date.now() - (component.renderHistory.length - index) * 1000,
      renderTime: measurement.duration,
    }));
  }, [selectedComponent, components]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "⇅";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <div className={styles.container}>
      {/* Component Loading Indicator */}
      {!state.isDemoMode &&
        components.length > 0 &&
        components.length < BRIZA_UI_COMPONENTS_EXPECTED && (
          <ComponentLoadingIndicator
            expectedCount={BRIZA_UI_COMPONENTS_EXPECTED}
            timeout={5000}
          />
        )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Component Performance Monitor</h1>
          <p className={styles.subtitle}>
            Real-time performance tracking for {components.length} components
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Renders</div>
            <div className={styles.statValue}>
              {formatNumber(
                components.reduce((sum, c) => sum + c.renderCount, 0)
              )}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Avg Performance</div>
            <div className={styles.statValue}>
              {formatNumber(
                components.reduce((sum, c) => sum + c.performanceScore, 0) /
                  components.length || 0
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Charts Section */}
      {sortedComponents.length > 0 && (
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Top 10 Components by Performance
            </h3>
            <PerformanceBarChart
              data={barChartData}
              bars={[
                {
                  dataKey: "Performance Score",
                  name: "Score",
                  color: "#10b981",
                },
              ]}
              height={300}
              yAxisLabel="Score"
              colorByValue
              getBarColor={(value) => getScoreColor(value)}
            />
          </div>

          {selectedComponentData && (
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>
                Render History: {selectedComponent}
              </h3>
              <PerformanceLineChart
                data={selectedComponentData}
                lines={[
                  {
                    dataKey: "renderTime",
                    name: "Render Time (ms)",
                    color: "#3b82f6",
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
        <h3 className={styles.tableTitle}>Component Details</h3>

        {sortedComponents.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📊</div>
            <div className={styles.emptyStateText}>
              {searchTerm
                ? "No components match your search"
                : "No components monitored yet"}
            </div>
            <div className={styles.emptyStateSubtext}>
              {searchTerm
                ? "Try adjusting your search terms"
                : "Start using components to see performance data"}
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Component {getSortIcon("name")}
                  </th>
                  <th onClick={() => handleSort("renderCount")}>
                    Renders {getSortIcon("renderCount")}
                  </th>
                  <th onClick={() => handleSort("avgRenderTime")}>
                    Avg Time {getSortIcon("avgRenderTime")}
                  </th>
                  <th onClick={() => handleSort("memoryUsage")}>
                    Memory {getSortIcon("memoryUsage")}
                  </th>
                  <th onClick={() => handleSort("performanceScore")}>
                    Score {getSortIcon("performanceScore")}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedComponents.map((component) => (
                  <tr
                    key={component.name}
                    className={
                      selectedComponent === component.name
                        ? styles.selectedRow
                        : ""
                    }
                  >
                    <td className={styles.componentName}>{component.name}</td>
                    <td>{formatNumber(component.renderCount)}</td>
                    <td>{formatDuration(component.avgRenderTime)}</td>
                    <td>{formatBytes(component.memoryUsage || 0)}</td>
                    <td>
                      <span
                        className={styles.scoreBadge}
                        style={{
                          backgroundColor: getScoreColor(
                            component.performanceScore
                          ),
                        }}
                      >
                        {formatNumber(component.performanceScore)}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewButton}
                        onClick={() => setSelectedComponent(component.name)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
