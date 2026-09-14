/**
 * PerformanceBarChart
 *
 * Comparison across components. Bars are capped at the top only — a rounded
 * foot lifts the bar off its own baseline and makes short bars read as
 * floating.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  SERIES,
  axisDefaults,
  gridDefaults,
  cursorDefaults,
} from "./chartTheme";
import { ChartTooltip, ChartLegend } from "./ChartFrame";
import styles from "./Charts.module.css";

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface PerformanceBarChartProps {
  data: DataPoint[];
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  colorByValue?: boolean;
  getBarColor?: (value: number) => string;
  /** Formats values in the tooltip. Defaults to the raw value. */
  valueFormatter?: (value: number | string) => string;
}

export default function PerformanceBarChart({
  data,
  bars,
  height = 260,
  yAxisLabel,
  showGrid = true,
  showLegend = false,
  colorByValue = false,
  getBarColor,
  valueFormatter,
}: PerformanceBarChartProps) {
  if (!data.length) {
    return <div className={styles.chartEmpty}>No data to plot</div>;
  }

  // Long component names on a categorical axis will collide. Rotating them is
  // the usual fix and it makes them slower to read; truncating keeps the axis
  // horizontal, and the full name is a hover away in the tooltip.
  //
  // The budget is derived from the number of bars rather than a fixed length,
  // because ten bars share the same width that four would otherwise each get.
  const maxChars = data.length > 8 ? 6 : data.length > 5 ? 9 : 14;

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: yAxisLabel ? 4 : -18, bottom: 0 }}
          barCategoryGap="28%"
        >
          {showGrid && <CartesianGrid {...gridDefaults} />}

          <XAxis
            dataKey="name"
            {...axisDefaults}
            interval={0}
            tickMargin={8}
            tickFormatter={(value: string) =>
              value.length > maxChars ? `${value.slice(0, maxChars - 1)}…` : value
            }
          />

          <YAxis {...axisDefaults} width={40} />

          <Tooltip
            cursor={cursorDefaults}
            content={<ChartTooltip valueFormatter={valueFormatter} />}
          />

          {showLegend && bars.length > 1 && <Legend content={<ChartLegend />} />}

          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || SERIES[index % SERIES.length]}
              radius={[3, 3, 0, 0]}
              maxBarSize={44}
              isAnimationActive={false}
            >
              {colorByValue &&
                getBarColor &&
                data.map((entry, cellIndex) => (
                  <Cell
                    key={cellIndex}
                    fill={getBarColor(Number(entry[bar.dataKey]))}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
