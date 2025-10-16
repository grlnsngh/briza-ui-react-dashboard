/**
 * TreeMapChart Component
 *
 * Treemap visualization for bundle size analysis
 * Built with Recharts library
 */

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatBytes } from "../../utils/formatters";
import styles from "./Charts.module.css";

interface TreeMapNode {
  name: string;
  size: number;
  children?: TreeMapNode[];
}

interface TreeMapChartProps {
  data: TreeMapNode[];
  height?: number;
  colorScheme?: string[];
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

export default function TreeMapChart({
  data,
  height = 400,
  colorScheme = DEFAULT_COLORS,
}: TreeMapChartProps) {
  const CustomContent = (props: any) => {
    const { x, y, width, height, name, size, index } = props;

    if (width < 50 || height < 30) return null;

    const color = colorScheme[index % colorScheme.length];

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: color,
            stroke: "#fff",
            strokeWidth: 2,
            opacity: 0.9,
          }}
        />
        {width > 80 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
              fontWeight="600"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 7}
              textAnchor="middle"
              fill="#fff"
              fontSize={10}
            >
              {formatBytes(size)}
            </text>
          </>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "var(--background-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            color: "var(--text-primary)",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, marginBottom: "4px" }}>
            {data.name}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--text-secondary)",
            }}
          >
            Size: {formatBytes(data.size)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={data as any}
          dataKey="size"
          stroke="#fff"
          fill="#3b82f6"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
