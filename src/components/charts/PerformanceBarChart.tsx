/**
 * PerformanceBarChart Component
 *
 * Bar chart for comparing performance metrics across components
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
import { CHART_COLORS } from "../../utils/constants";
import styles from "./Charts.module.css";

const COLORS = Object.values(CHART_COLORS);

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
}

export default function PerformanceBarChart({
  data,
  bars,
  height = 300,
  xAxisLabel,
  yAxisLabel,
  showGrid = true,
  showLegend = true,
  colorByValue = false,
  getBarColor,
}: PerformanceBarChartProps) {
  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          )}
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            angle={-45}
            textAnchor="end"
            height={80}
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
          />
          {showLegend && <Legend />}
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.color || COLORS[index % COLORS.length]}
            >
              {colorByValue &&
                getBarColor &&
                data.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={getBarColor(entry[bar.dataKey] as number)}
                  />
                ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
