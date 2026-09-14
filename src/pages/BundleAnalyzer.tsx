/**
 * Bundle Analyzer
 *
 * Where the shipped bytes go. The figures below are build statistics, not live
 * measurements, so the page says so at the top — a number that looks like the
 * live ones but is not collected the same way has to be labelled, or the whole
 * dashboard becomes harder to trust.
 */

import { useMemo } from "react";
import { formatBytes, formatPercentage } from "../utils/formatters";
import { TreeMapChart, PerformanceBarChart } from "../components/charts";
import {
  PageHeader,
  Panel,
  Metric,
  Badge,
  Icon,
  type Tone,
  type IconName,
} from "../components/common";
import styles from "./BundleAnalyzer.module.css";

// Build statistics. In production these would be read from the bundler's
// stats output rather than hard-coded.
const mockBundleData = {
  totalSize: 2458934,
  chunks: [
    { name: "main", size: 856234, gzipped: 298765 },
    { name: "react-vendor", size: 734521, gzipped: 156342 },
    { name: "charts", size: 445632, gzipped: 98234 },
    { name: "query", size: 234567, gzipped: 67890 },
    { name: "animation", size: 187980, gzipped: 45678 },
  ],
  dependencies: [
    { name: "react", size: 345678, version: "18.3.1" },
    { name: "react-dom", size: 388843, version: "18.3.1" },
    { name: "react-router-dom", size: 234567, version: "6.26.0" },
    { name: "recharts", size: 445632, version: "2.12.7" },
    { name: "framer-motion", size: 187980, version: "11.5.4" },
    { name: "@tanstack/react-query", size: 234567, version: "5.56.2" },
    { name: "web-vitals", size: 45632, version: "4.2.3" },
  ],
  treemapData: [
    {
      name: "App",
      size: 2458934,
      children: [
        {
          name: "react-vendor",
          size: 734521,
          children: [
            { name: "react", size: 345678 },
            { name: "react-dom", size: 388843 },
          ],
        },
        {
          name: "charts",
          size: 445632,
          children: [{ name: "recharts", size: 445632 }],
        },
        {
          name: "routing",
          size: 234567,
          children: [{ name: "react-router-dom", size: 234567 }],
        },
        {
          name: "animation",
          size: 187980,
          children: [{ name: "framer-motion", size: 187980 }],
        },
        {
          name: "query",
          size: 234567,
          children: [{ name: "@tanstack/react-query", size: 234567 }],
        },
        { name: "main", size: 621667 },
      ],
    },
  ],
};

const suggestions: {
  tone: Tone;
  icon: IconName;
  title: string;
  description: string;
  impact: string;
}[] = [
  {
    tone: "good",
    icon: "checkCircle",
    title: "Code splitting in place",
    description:
      "Route-based splitting keeps roughly 40% of the bundle out of the initial load.",
    impact: "High",
  },
  {
    tone: "warn",
    icon: "alertTriangle",
    title: "Chart library is heavy",
    description:
      "Recharts accounts for 445 KB uncompressed. Lazy-load the chart routes, or move to a lighter plotting library.",
    impact: "Medium",
  },
  {
    tone: "info",
    icon: "info",
    title: "Serve modern image formats",
    description:
      "WebP or AVIF with lazy loading would cut image bandwidth without touching the JavaScript budget.",
    impact: "Low",
  },
  {
    tone: "good",
    icon: "checkCircle",
    title: "Tree shaking active",
    description: "Unused exports are eliminated during the production build.",
    impact: "High",
  },
];

const impactTone: Record<string, Tone> = {
  High: "good",
  Medium: "warn",
  Low: "info",
};

export default function BundleAnalyzer() {
  const chunkChartData = useMemo(
    () =>
      mockBundleData.chunks.map((chunk) => ({
        name: chunk.name,
        Original: chunk.size,
        Gzipped: chunk.gzipped,
      })),
    []
  );

  const { compression, gzippedTotal } = useMemo(() => {
    const original = mockBundleData.chunks.reduce((sum, c) => sum + c.size, 0);
    const gzipped = mockBundleData.chunks.reduce(
      (sum, c) => sum + c.gzipped,
      0
    );
    return {
      compression: (1 - gzipped / original) * 100,
      gzippedTotal: gzipped,
    };
  }, []);

  const dependencies = useMemo(
    () => [...mockBundleData.dependencies].sort((a, b) => b.size - a.size),
    []
  );

  const largest = mockBundleData.chunks.reduce((max, chunk) =>
    chunk.size > max.size ? chunk : max
  );

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Analyze"
        title="Bundle Analyzer"
        description="Module weight, chunk splitting and compression, read from the production build."
        actions={<Badge tone="neutral">Build statistics</Badge>}
      />

      <div className={styles.readings}>
        <div className={styles.reading}>
          <Metric
            label="Total size"
            value={formatBytes(mockBundleData.totalSize)}
            context="Uncompressed, all chunks"
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Transferred"
            value={formatBytes(gzippedTotal)}
            status="good"
            context={`${formatPercentage(compression, 1)} smaller gzipped`}
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Chunks"
            value={mockBundleData.chunks.length}
            context={`Largest is ${largest.name}`}
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Dependencies"
            value={dependencies.length}
            context={`${dependencies[0].name} is heaviest`}
          />
        </div>
      </div>

      <Panel
        title="Composition"
        description="Area is proportional to uncompressed size."
      >
        <TreeMapChart data={mockBundleData.treemapData} height={360} />
      </Panel>

      <Panel
        title="Chunks"
        description="Uncompressed against gzipped, per chunk."
      >
        <PerformanceBarChart
          data={chunkChartData}
          bars={[
            { dataKey: "Original", name: "Uncompressed" },
            { dataKey: "Gzipped", name: "Gzipped" },
          ]}
          height={240}
          showLegend
          valueFormatter={(value) => formatBytes(Number(value))}
        />
      </Panel>

      <Panel flush title="Dependencies" description="Largest first.">
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Package</th>
                <th>Version</th>
                <th className={styles.right}>Size</th>
                <th className={styles.shareCol}>Share of bundle</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dependency) => {
                const share =
                  (dependency.size / mockBundleData.totalSize) * 100;
                return (
                  <tr key={dependency.name}>
                    <td className={styles.name}>{dependency.name}</td>
                    <td className={`${styles.mono} ${styles.version}`}>
                      {dependency.version}
                    </td>
                    <td className={`${styles.right} ${styles.mono} tabular`}>
                      {formatBytes(dependency.size)}
                    </td>
                    <td>
                      <span className={styles.share}>
                        <span className={styles.shareTrack}>
                          <span
                            className={styles.shareFill}
                            style={{ inlineSize: `${share}%` }}
                          />
                        </span>
                        <span className={`${styles.shareValue} tabular`}>
                          {formatPercentage(share, 1)}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Suggestions"
        description="Ordered by what they would save, not by how easy they are."
      >
        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <div className={styles.suggestion} key={suggestion.title}>
              <span
                className={`${styles.suggestionIcon} ${
                  styles[`tone${suggestion.tone}`]
                }`}
              >
                <Icon name={suggestion.icon} size={15} />
              </span>
              <div className={styles.suggestionText}>
                <div className={styles.suggestionHead}>
                  <h3 className={styles.suggestionTitle}>{suggestion.title}</h3>
                  <Badge tone={impactTone[suggestion.impact] ?? "neutral"}>
                    {suggestion.impact}
                  </Badge>
                </div>
                <p className={styles.suggestionBody}>{suggestion.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
