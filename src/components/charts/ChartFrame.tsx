/**
 * Chart tooltip and legend
 *
 * Kept apart from `chartTheme.ts` so this module exports components only —
 * mixing constants and components in one file breaks React Fast Refresh.
 */

import type { ReactNode } from "react";
import styles from "./Charts.module.css";

interface TooltipEntry {
  name?: ReactNode;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: ReactNode;
  /** Formats the header. Use for timestamps. */
  labelFormatter?: (label: unknown) => ReactNode;
  /** Formats each value. Receives the raw value and the series name. */
  valueFormatter?: (value: number | string, name?: ReactNode) => ReactNode;
}

/**
 * Tooltip
 *
 * Built rather than styled, because Recharts' default renders its label and
 * values at the same size and weight — which makes the number, the one thing
 * you opened the tooltip for, no easier to find than its caption.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      {label !== undefined && label !== "" && (
        <div className={styles.tooltipLabel}>
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className={styles.tooltipRows}>
        {payload.map((entry, index) => (
          <div className={styles.tooltipRow} key={`${entry.dataKey}-${index}`}>
            <span
              className={styles.tooltipSwatch}
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            <span className={styles.tooltipName}>{entry.name}</span>
            <span className={`${styles.tooltipValue} tabular`}>
              {valueFormatter && entry.value !== undefined
                ? valueFormatter(entry.value, entry.name)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Legend that matches the tooltip rather than Recharts' default text run. */
export function ChartLegend({
  payload,
}: {
  payload?: { value?: ReactNode; color?: string }[];
}) {
  if (!payload?.length) return null;

  return (
    <div className={styles.legend}>
      {payload.map((entry, index) => (
        <span className={styles.legendItem} key={index}>
          <span
            className={styles.legendSwatch}
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}
