/**
 * Metric
 *
 * A single reading: what it is, what it says, and what that means.
 *
 * The value is tabular so a ticking number never reflows its neighbours, and
 * the unit is set separately at a smaller size — "142 ms" with the unit at full
 * size reads as two numbers competing, which is exactly wrong when the whole
 * point is to compare the figure against its siblings.
 *
 * `status` tints the value only. Tinting the whole tile turns a reading into
 * an alarm, and a wall of alarms stops meaning anything.
 */

import type { ReactNode } from "react";
import styles from "./Surface.module.css";

export type MetricStatus = "neutral" | "good" | "warn" | "bad";

interface MetricProps {
  label: ReactNode;
  /** Pre-formatted. Pass "—" for genuinely absent data, never 0. */
  value: ReactNode;
  unit?: ReactNode;
  /** One line under the value: a target, a share, or where to go next. */
  context?: ReactNode;
  status?: MetricStatus;
  /** Rendered right of the label — a sparkline, a count, a link. */
  aside?: ReactNode;
  size?: "md" | "lg";
}

const statusClass: Record<MetricStatus, string> = {
  neutral: "",
  good: styles.valueGood,
  warn: styles.valueWarn,
  bad: styles.valueBad,
};

export function Metric({
  label,
  value,
  unit,
  context,
  status = "neutral",
  aside,
  size = "md",
}: MetricProps) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricHead}>
        <span className={styles.metricLabel}>{label}</span>
        {aside && <span className={styles.metricAside}>{aside}</span>}
      </div>

      <div
        className={`${styles.metricValue} ${
          size === "lg" ? styles.metricValueLg : ""
        } ${statusClass[status]} tabular`}
      >
        {value}
        {unit && <span className={styles.metricUnit}>{unit}</span>}
      </div>

      {context && <div className={styles.metricContext}>{context}</div>}
    </div>
  );
}
