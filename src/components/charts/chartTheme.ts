/**
 * Chart theme
 *
 * Shared Recharts configuration, so every chart in the app is drawn by the
 * same hand. Recharts defaults are generic on purpose; these overrides are
 * what make the charts read as part of this interface rather than as a widget
 * dropped into it.
 *
 * The decisions worth stating:
 *
 * - Horizontal gridlines only. A categorical x-axis does not need vertical
 *   rules — they add ink without adding a reference to read a value against.
 * - No axis lines and no tick marks. The gridlines already establish the
 *   scale, so the axis line is a third redundant edge next to the panel border.
 * - Solid hairlines instead of dashes. Dashed grids shimmer against small text.
 * - Tick labels in mono at 11px, so digits align down the axis.
 * - Legends only when there is genuinely more than one series to tell apart.
 */

/** Categorical series, distinct in both hue and lightness. */
export const SERIES = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
];

/** Status thresholds shared with the score bars and badges. */
export function scoreColor(score: number): string {
  if (score >= 90) return "var(--good)";
  if (score >= 70) return "var(--warn)";
  return "var(--bad)";
}

export const axisDefaults = {
  stroke: "transparent",
  tickLine: false,
  axisLine: false,
  tick: {
    fill: "var(--text-3)",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
  },
} as const;

export const gridDefaults = {
  stroke: "var(--grid-line)",
  strokeDasharray: "0",
  vertical: false,
} as const;

/** Recharts' hover highlight; the default is a heavy opaque block. */
export const cursorDefaults = {
  fill: "var(--surface-2)",
  fillOpacity: 0.6,
} as const;
