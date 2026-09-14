/**
 * Component Monitor
 *
 * The full table of what has been measured. The dashboard says which
 * components are worth attention; this page is where you read the numbers and
 * sort by whichever one you care about.
 *
 * Selecting a row opens its render history rather than navigating away, so
 * comparing two components is two clicks instead of two page loads.
 */

import { useState, useMemo } from "react";
import { usePerformanceState } from "../contexts";
import { formatDuration, formatBytes, formatNumber } from "../utils/formatters";
import { PerformanceLineChart, PerformanceBarChart } from "../components/charts";
import { scoreColor } from "../components/charts/chartTheme";
import {
  ComponentLoadingIndicator,
  PageHeader,
  Panel,
  Metric,
  ScoreBar,
  Button,
  Icon,
} from "../components/common";
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

const columns: {
  field: SortField;
  label: string;
  align: "left" | "right";
}[] = [
  { field: "name", label: "Component", align: "left" },
  { field: "renderCount", label: "Renders", align: "right" },
  { field: "avgRenderTime", label: "Avg time", align: "right" },
  { field: "memoryUsage", label: "Memory", align: "right" },
  { field: "performanceScore", label: "Score", align: "right" },
];

export default function ComponentMonitor() {
  const { componentMetrics, isDemoMode } = usePerformanceState();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("performanceScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selected, setSelected] = useState<string | null>(null);

  const components = useMemo(
    () =>
      Array.from(componentMetrics.entries())
        .filter(
          ([name]) =>
            !(DASHBOARD_COMPONENTS as readonly string[]).includes(name)
        )
        .map(([name, metrics]) => ({ name, ...metrics })),
    [componentMetrics]
  );

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = term
      ? components.filter((c) => c.name.toLowerCase().includes(term))
      : components;

    return [...filtered].sort((a, b) => {
      if (sortField === "name") {
        const compared = a.name.localeCompare(b.name);
        return sortDirection === "asc" ? compared : -compared;
      }
      const aValue = a[sortField] ?? 0;
      const bValue = b[sortField] ?? 0;
      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
  }, [components, searchTerm, sortField, sortDirection]);

  const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
  const avgScore = components.length
    ? components.reduce((sum, c) => sum + c.performanceScore, 0) /
      components.length
    : 0;
  const slowest = components.reduce(
    (worst, c) => (c.avgRenderTime > (worst?.avgRenderTime ?? -1) ? c : worst),
    components[0]
  );

  // Worst ten by score — the chart answers "how bad is the tail", which a
  // table sorted the same way makes you count rows to work out.
  const chartData = useMemo(
    () =>
      [...components]
        .sort((a, b) => a.performanceScore - b.performanceScore)
        .slice(0, 10)
        .map((c) => ({ name: c.name, Score: c.performanceScore })),
    [components]
  );

  const history = useMemo(() => {
    if (!selected) return null;
    const component = components.find((c) => c.name === selected);
    if (!component?.renderHistory.length) return null;

    return component.renderHistory.map((measurement, index) => ({
      timestamp:
        measurement.timestamp ||
        Date.now() - (component.renderHistory.length - index) * 1000,
      renderTime: measurement.duration,
    }));
  }, [selected, components]);

  const sort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      // Names read naturally A–Z; every measurement is most useful worst-first.
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const partial =
    !isDemoMode &&
    components.length > 0 &&
    components.length < BRIZA_UI_COMPONENTS_EXPECTED;

  return (
    <div className={styles.page}>
      {partial && (
        <ComponentLoadingIndicator
          expectedCount={BRIZA_UI_COMPONENTS_EXPECTED}
          timeout={5000}
        />
      )}

      <PageHeader
        eyebrow="Analyze"
        title="Component Monitor"
        description="Every measured component, with render counts, timings and memory as reported by the React Profiler."
      />

      <div className={styles.readings}>
        <div className={styles.reading}>
          <Metric
            label="Components"
            value={components.length || "—"}
            context={
              searchTerm ? `${visible.length} matching` : "In this session"
            }
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Total renders"
            value={components.length ? formatNumber(totalRenders, 0) : "—"}
            context={
              components.length
                ? `${formatNumber(totalRenders / components.length, 0)} per component`
                : "No measurements yet"
            }
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Average score"
            value={components.length ? formatNumber(avgScore, 0) : "—"}
            status={
              !components.length
                ? "neutral"
                : avgScore >= 90
                ? "good"
                : avgScore >= 70
                ? "warn"
                : "bad"
            }
            context="0–100, higher is better"
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Slowest render"
            value={slowest ? formatDuration(slowest.avgRenderTime) : "—"}
            context={slowest ? slowest.name : "No measurements yet"}
          />
        </div>
      </div>

      {components.length > 0 && (
        <div className={styles.charts}>
          <Panel
            title="Lowest scores"
            description="The ten components furthest from a clean run."
          >
            <PerformanceBarChart
              data={chartData}
              bars={[{ dataKey: "Score", name: "Score" }]}
              height={240}
              colorByValue
              getBarColor={scoreColor}
              valueFormatter={(value) => formatNumber(Number(value), 0)}
            />
          </Panel>

          <Panel
            title={selected ? `Render history: ${selected}` : "Render history"}
            description={
              selected
                ? "Every recorded render for this component, oldest first."
                : "Select a row below to plot its render history."
            }
            actions={
              selected ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon="close"
                  onClick={() => setSelected(null)}
                  aria-label="Clear selection"
                />
              ) : undefined
            }
          >
            {history ? (
              <PerformanceLineChart
                data={history}
                lines={[{ dataKey: "renderTime", name: "Render time" }]}
                height={240}
                valueFormatter={(value) => formatDuration(Number(value))}
              />
            ) : (
              <div className={styles.chartPlaceholder}>
                <Icon name="activity" size={18} />
                <span>
                  {selected
                    ? "No render history recorded for this component."
                    : "No component selected."}
                </span>
              </div>
            )}
          </Panel>
        </div>
      )}

      <Panel
        flush
        title="All components"
        actions={
          <label className={styles.search}>
            <Icon name="search" size={14} className={styles.searchIcon} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Filter by name"
              className={styles.searchInput}
              aria-label="Filter components by name"
            />
          </label>
        }
      >
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <Icon name={searchTerm ? "search" : "activity"} size={18} />
            <div className={styles.emptyTitle}>
              {searchTerm
                ? `Nothing matches “${searchTerm}”`
                : "No components measured yet"}
            </div>
            <p className={styles.emptyBody}>
              {searchTerm
                ? "Check the spelling, or clear the filter to see everything."
                : "Components report as they mount. Open the showcase to render the library."}
            </p>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const active = sortField === column.field;
                    return (
                      <th
                        key={column.field}
                        className={column.align === "right" ? styles.right : ""}
                        aria-sort={
                          active
                            ? sortDirection === "asc"
                              ? "ascending"
                              : "descending"
                            : "none"
                        }
                      >
                        <button
                          className={`${styles.sortButton} ${
                            active ? styles.sortActive : ""
                          }`}
                          onClick={() => sort(column.field)}
                        >
                          {column.label}
                          <Icon
                            name={
                              active
                                ? sortDirection === "asc"
                                  ? "chevronUp"
                                  : "chevronDown"
                                : "chevronDown"
                            }
                            size={12}
                            className={
                              active ? styles.sortIcon : styles.sortIconIdle
                            }
                          />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((component) => (
                  <tr
                    key={component.name}
                    className={
                      selected === component.name ? styles.rowSelected : ""
                    }
                    onClick={() =>
                      setSelected((current) =>
                        current === component.name ? null : component.name
                      )
                    }
                  >
                    <td className={styles.name}>{component.name}</td>
                    <td className={`${styles.right} tabular`}>
                      {formatNumber(component.renderCount, 0)}
                    </td>
                    <td className={`${styles.right} ${styles.mono} tabular`}>
                      {formatDuration(component.avgRenderTime)}
                    </td>
                    <td className={`${styles.right} ${styles.mono} tabular`}>
                      {component.memoryUsage
                        ? formatBytes(component.memoryUsage)
                        : "—"}
                    </td>
                    <td className={styles.right}>
                      <span className={styles.score}>
                        <ScoreBar score={component.performanceScore} />
                        <span className={`${styles.scoreValue} tabular`}>
                          {formatNumber(component.performanceScore, 0)}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
