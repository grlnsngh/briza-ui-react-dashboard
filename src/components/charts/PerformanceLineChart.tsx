/**
 * PerformanceLineChart
 *
 * A metric over time. Dots are off by default: at fifty render samples they
 * merge into a beaded rope and hide the shape of the line, which is the only
 * reason to draw it. The active dot on hover still marks the read point.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { SERIES, axisDefaults, gridDefaults } from "./chartTheme";
import { ChartTooltip, ChartLegend } from "./ChartFrame";
import styles from "./Charts.module.css";

interface DataPoint {
  timestamp: number;
  [key: string]: number;
}

interface PerformanceLineChartProps {
  data: DataPoint[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number | string) => string;
}

const formatTimestamp = (timestamp: unknown) =>
  new Date(Number(timestamp)).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function PerformanceLineChart({
  data,
  lines,
  height = 260,
  yAxisLabel,
  showGrid = true,
  showLegend = false,
  valueFormatter,
}: PerformanceLineChartProps) {
  if (!data.length) {
    return <div className={styles.chartEmpty}>No data to plot</div>;
  }

  const dense = data.length > 24;

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: yAxisLabel ? 4 : -18, bottom: 0 }}
        >
          {showGrid && <CartesianGrid {...gridDefaults} />}

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            minTickGap={44}
            {...axisDefaults}
          />

          <YAxis {...axisDefaults} width={40} />

          <Tooltip
            cursor={{ stroke: "var(--line-strong)", strokeWidth: 1 }}
            content={
              <ChartTooltip
                labelFormatter={formatTimestamp}
                valueFormatter={valueFormatter}
              />
            }
          />

          {showLegend && lines.length > 1 && (
            <Legend content={<ChartLegend />} />
          )}

          {lines.map((line, index) => {
            const color = line.color || SERIES[index % SERIES.length];
            return (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={color}
                strokeWidth={1.75}
                dot={dense ? false : { r: 2, fill: color, strokeWidth: 0 }}
                activeDot={{
                  r: 3.5,
                  fill: color,
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
