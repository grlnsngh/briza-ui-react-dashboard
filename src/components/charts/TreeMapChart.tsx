/**
 * TreeMapChart
 *
 * Bundle weight by module. Tiles are separated by the panel background rather
 * than a white stroke, so the map does not grow a bright grid over it in dark
 * mode. Labels are drawn in a fixed near-black or near-white chosen against
 * each tile's own fill, because a tile's colour is data and the label has to
 * stay readable on all of them.
 */

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { formatBytes } from "../../utils/formatters";
import styles from "./Charts.module.css";

interface TreeMapNode {
  name: string;
  size: number;
  children?: TreeMapNode[];
  /**
   * Recharts' `TreemapDataType` carries an open index signature because it
   * augments each node internally. Mirroring it here lets `data` be passed
   * without an `any` cast.
   */
  [key: string]: unknown;
}

interface TreeMapChartProps {
  data: TreeMapNode[];
  height?: number;
  colorScheme?: string[];
}

/**
 * Props Recharts passes to a Treemap `content` renderer. All are optional
 * because Recharts also renders the element once without layout values.
 */
interface TreeMapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  size?: number;
  index?: number;
}

/** Props Recharts passes to a Tooltip `content` renderer. */
interface TreeMapTooltipProps {
  active?: boolean;
  payload?: { payload: TreeMapNode }[];
}

/**
 * A single hue stepped through lightness rather than six unrelated colours.
 * Tile colour here encodes nothing — size already does that — so a sequential
 * ramp keeps the map calm and stops the eye reading false categories into it.
 */
const DEFAULT_COLORS = [
  "#3a3596",
  "#423da6",
  "#4a45b4",
  "#534ec1",
  "#5c57cc",
  "#6661d6",
  "#706be0",
  "#7b76e8",
];

/** Label colour picked against the tile fill, not the page theme. */
function labelInk(hex: string): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  // Rec. 601 luma — good enough for a two-way light/dark decision.
  const luma = (r * 299 + g * 587 + b * 114) / 1000;
  return luma > 140 ? "#0a0b0d" : "#ffffff";
}

export default function TreeMapChart({
  data,
  height = 360,
  colorScheme = DEFAULT_COLORS,
}: TreeMapChartProps) {
  const CustomContent = (props: TreeMapContentProps) => {
    const {
      x = 0,
      y = 0,
      width = 0,
      height: tileHeight = 0,
      name = "",
      size = 0,
      index = 0,
    } = props;

    if (width <= 0 || tileHeight <= 0) return null;

    const color = colorScheme[index % colorScheme.length];
    const ink = labelInk(color);
    const roomForLabel = width > 74 && tileHeight > 38;
    const roomForSize = width > 74 && tileHeight > 54;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={tileHeight}
          rx={3}
          style={{
            fill: color,
            stroke: "var(--surface)",
            strokeWidth: 2,
          }}
        />
        {roomForLabel && (
          <text
            x={x + 10}
            y={y + 20}
            fill={ink}
            fontSize={11}
            fontWeight={550}
            opacity={0.95}
          >
            {name.length > Math.floor(width / 7)
              ? `${name.slice(0, Math.max(3, Math.floor(width / 7) - 1))}…`
              : name}
          </text>
        )}
        {roomForSize && (
          <text
            x={x + 10}
            y={y + 36}
            fill={ink}
            fontSize={10}
            fontFamily="var(--font-mono)"
            opacity={0.7}
          >
            {formatBytes(size)}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: TreeMapTooltipProps) => {
    if (!active || !payload?.length) return null;
    const node = payload[0].payload;

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{node.name}</div>
        <div className={styles.tooltipRows}>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipName}>Size</span>
            <span className={`${styles.tooltipValue} tabular`}>
              {formatBytes(node.size)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!data.length) {
    return <div className={styles.chartEmpty}>No modules to plot</div>;
  }

  return (
    <div className={styles.chartContainer}>
      <ResponsiveContainer width="100%" height={height}>
        <Treemap
          data={data}
          dataKey="size"
          stroke="var(--surface)"
          fill={DEFAULT_COLORS[0]}
          content={<CustomContent />}
          isAnimationActive={false}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
