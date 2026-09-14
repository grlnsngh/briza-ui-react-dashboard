/**
 * Re-render Tracker
 *
 * Finds components that render more often than their inputs change. A high
 * render count is not a fault on its own — a component that renders 200 times
 * in under a millisecond costs nothing. What matters is count multiplied by
 * cost, which is why the flag is a threshold on both.
 */

import { useState, useMemo } from "react";
import { usePerformanceState } from "../contexts";
import { formatDuration, formatNumber } from "../utils/formatters";
import { PerformanceLineChart, PerformanceBarChart } from "../components/charts";
import {
  PageHeader,
  Panel,
  Metric,
  Badge,
  Button,
  Icon,
  type IconName,
} from "../components/common";
import styles from "./RerenderTracker.module.css";

/** A component is worth attention only when it renders often *and* slowly. */
const BUSY_RENDER_COUNT = 10;
const SLOW_RENDER_MS = 10;

const tips: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "React.memo",
    body: "Skip a re-render when props are shallow-equal. Worth it for components that render often with the same input, not for cheap leaves.",
  },
  {
    icon: "repeat",
    title: "useMemo and useCallback",
    body: "Keep referential equality for values and handlers passed into memoised children, otherwise memo never gets a chance to bail out.",
  },
  {
    icon: "package",
    title: "Code splitting",
    body: "Break large components apart and load the rarely-used branches lazily, so the first render has less to do.",
  },
  {
    icon: "bolt",
    title: "Context granularity",
    body: "Split context by update frequency. One context holding everything re-renders every consumer whenever any part of it changes.",
  },
];

export default function RerenderTracker() {
  const { componentMetrics } = usePerformanceState();
  const [selected, setSelected] = useState<string | null>(null);
  const [onlyProblematic, setOnlyProblematic] = useState(false);

  const components = useMemo(
    () =>
      Array.from(componentMetrics.entries()).map(([name, metrics]) => ({
        name,
        renderCount: metrics.renderCount,
        avgRenderTime: metrics.avgRenderTime,
        lastRenderTime: metrics.lastRenderTime,
        totalRenderTime: metrics.totalRenderTime,
        renderHistory: metrics.renderHistory,
        isProblematic:
          metrics.renderCount > BUSY_RENDER_COUNT &&
          metrics.avgRenderTime > SLOW_RENDER_MS,
      })),
    [componentMetrics]
  );

  const visible = useMemo(() => {
    const filtered = onlyProblematic
      ? components.filter((c) => c.isProblematic)
      : components;
    return [...filtered].sort((a, b) => b.renderCount - a.renderCount);
  }, [components, onlyProblematic]);

  const chartData = useMemo(
    () =>
      visible.slice(0, 10).map((c) => ({
        name: c.name,
        Renders: c.renderCount,
      })),
    [visible]
  );

  const timeline = useMemo(() => {
    if (!selected) return null;
    const component = components.find((c) => c.name === selected);
    if (!component?.renderHistory.length) return null;

    return component.renderHistory.slice(-50).map((measurement, index) => ({
      timestamp:
        measurement.timestamp ||
        Date.now() - (component.renderHistory.length - index) * 1000,
      renderTime: measurement.duration,
    }));
  }, [selected, components]);

  const totalRenders = components.reduce((sum, c) => sum + c.renderCount, 0);
  const problematic = components.filter((c) => c.isProblematic).length;
  const busiest = visible[0];

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Analyze"
        title="Re-render Tracker"
        description={`Components flagged when they render more than ${BUSY_RENDER_COUNT} times and average over ${SLOW_RENDER_MS}ms — frequency alone is not a problem.`}
      />

      <div className={styles.readings}>
        <div className={styles.reading}>
          <Metric
            label="Total renders"
            value={components.length ? formatNumber(totalRenders, 0) : "—"}
            context="Across every tracked component"
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Components"
            value={components.length || "—"}
            context={
              onlyProblematic ? `${visible.length} shown` : "Reporting metrics"
            }
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Flagged"
            value={components.length ? problematic : "—"}
            status={
              !components.length ? "neutral" : problematic > 0 ? "warn" : "good"
            }
            context={
              !components.length
                ? "No measurements yet"
                : problematic > 0
                ? "Frequent and slow"
                : "Nothing above both thresholds"
            }
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Busiest"
            value={busiest ? formatNumber(busiest.renderCount, 0) : "—"}
            context={busiest ? busiest.name : "No measurements yet"}
          />
        </div>
      </div>

      {components.length > 0 && (
        <div className={styles.charts}>
          <Panel
            title="Most re-rendered"
            description="The ten busiest components by render count."
          >
            <PerformanceBarChart
              data={chartData}
              bars={[{ dataKey: "Renders", name: "Renders" }]}
              height={240}
              valueFormatter={(value) => formatNumber(Number(value), 0)}
            />
          </Panel>

          <Panel
            title={selected ? `Timeline: ${selected}` : "Render timeline"}
            description={
              selected
                ? "The last fifty renders recorded for this component."
                : "Select a row below to plot its timeline."
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
            {timeline ? (
              <PerformanceLineChart
                data={timeline}
                lines={[{ dataKey: "renderTime", name: "Render time" }]}
                height={240}
                valueFormatter={(value) => formatDuration(Number(value))}
              />
            ) : (
              <div className={styles.chartPlaceholder}>
                <Icon name="repeat" size={18} />
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
        title="Re-render detail"
        actions={
          <label className={styles.filter}>
            <input
              type="checkbox"
              checked={onlyProblematic}
              onChange={(event) => setOnlyProblematic(event.target.checked)}
            />
            <span>Flagged only</span>
          </label>
        }
      >
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <Icon name={onlyProblematic ? "checkCircle" : "repeat"} size={18} />
            <div className={styles.emptyTitle}>
              {onlyProblematic
                ? "Nothing flagged"
                : "No components measured yet"}
            </div>
            <p className={styles.emptyBody}>
              {onlyProblematic
                ? "No component is both rendering frequently and rendering slowly."
                : "Components report as they mount. Open the showcase to render the library."}
            </p>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th className={styles.right}>Renders</th>
                  <th className={styles.right}>Avg time</th>
                  <th className={styles.right}>Last render</th>
                  <th className={styles.right}>Total time</th>
                  <th className={styles.right}>Status</th>
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
                      {formatDuration(component.lastRenderTime)}
                    </td>
                    <td className={`${styles.right} ${styles.mono} tabular`}>
                      {formatDuration(component.totalRenderTime)}
                    </td>
                    <td className={styles.right}>
                      <Badge tone={component.isProblematic ? "warn" : "good"}>
                        {component.isProblematic ? "Review" : "Fine"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel
        title="Reducing re-renders"
        description="Reach for these in order of cost — the cheapest fix is usually to stop creating new object identities."
      >
        <div className={styles.tips}>
          {tips.map((tip) => (
            <div className={styles.tip} key={tip.title}>
              <span className={styles.tipIcon}>
                <Icon name={tip.icon} size={15} />
              </span>
              <div>
                <h3 className={styles.tipTitle}>{tip.title}</h3>
                <p className={styles.tipBody}>{tip.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
