/**
 * PerformanceLineChart Component
 *
 * Line chart for displaying performance metrics over time
 * Built with Recharts library
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
import { CHART_COLORS } from "../../utils/constants";
import styles from "./Charts.module.css";

const COLORS = Object.values(CHART_COLORS);

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
}

export default function PerformanceLineChart({
  data,
  lines,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  showLegend = true,
}: PerformanceLineChartProps) {
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          )}
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
            stroke="var(--text-secondary)"
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: "insideBottom", offset: -5 }
                : undefined
            }
          />
          <YAxis
            stroke="var(--text-secondary)"
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: "insideLeft" }
                : undefined
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--background-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
            }}
            labelFormatter={formatTimestamp}
          />
          {showLegend && <Legend />}
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color || COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
