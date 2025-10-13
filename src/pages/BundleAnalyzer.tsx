/**
 * Bundle Analyzer Page
 *
 * Analyzes bundle sizes, chunks, and dependencies.
 * Provides optimization suggestions and size trends.
 */

import { useMemo } from "react";
import { formatBytes, formatPercentage } from "../utils/formatters";
import { TreeMapChart, PerformanceBarChart } from "../components/charts";
import styles from "./BundleAnalyzer.module.css";

// Mock bundle data (in production, this would come from build stats)
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

const optimizationSuggestions = [
  {
    type: "success",
    title: "Code Splitting Implemented",
    description:
      "Route-based code splitting is reducing initial bundle size by ~40%",
    impact: "High",
  },
  {
    type: "warning",
    title: "Large Chart Library",
    description:
      "Recharts is 445 KB. Consider lazy loading or using a lighter alternative",
    impact: "Medium",
  },
  {
    type: "info",
    title: "Optimize Images",
    description:
      "Use WebP format and lazy loading for images to reduce bandwidth",
    impact: "Low",
  },
  {
    type: "success",
    title: "Tree Shaking Active",
    description: "Unused code is being eliminated during build",
    impact: "High",
  },
];

export default function BundleAnalyzer() {
  // Prepare chunk data for bar chart
  const chunkChartData = useMemo(() => {
    return mockBundleData.chunks.map((chunk) => ({
      name: chunk.name,
      Original: chunk.size,
      Gzipped: chunk.gzipped,
    }));
  }, []);

  // Calculate compression ratio
  const compressionRatio = useMemo(() => {
    const totalOriginal = mockBundleData.chunks.reduce(
      (sum, c) => sum + c.size,
      0
    );
    const totalGzipped = mockBundleData.chunks.reduce(
      (sum, c) => sum + c.gzipped,
      0
    );
    return ((1 - totalGzipped / totalOriginal) * 100).toFixed(1);
  }, []);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "var(--color-success)";
      case "Medium":
        return "var(--color-warning)";
      case "Low":
        return "var(--color-info)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bundle Size Analyzer</h1>
          <p className={styles.subtitle}>
            Analyze and optimize your application bundle
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Size</div>
            <div className={styles.statValue}>
              {formatBytes(mockBundleData.totalSize)}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Compression</div>
            <div
              className={styles.statValue}
              style={{ color: "var(--color-success)" }}
            >
              {compressionRatio}%
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Chunks</div>
            <div className={styles.statValue}>
              {mockBundleData.chunks.length}
            </div>
          </div>
        </div>
      </div>

      {/* TreeMap Visualization */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Bundle Composition</h2>
        <div className={styles.card}>
          <TreeMapChart data={mockBundleData.treemapData} height={450} />
        </div>
      </div>

      {/* Chunks Comparison */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Chunk Size Comparison</h2>
        <div className={styles.card}>
          <PerformanceBarChart
            data={chunkChartData}
            bars={[
              { dataKey: "Original", name: "Original Size", color: "#3b82f6" },
              { dataKey: "Gzipped", name: "Gzipped Size", color: "#10b981" },
            ]}
            height={300}
            yAxisLabel="Size (bytes)"
          />
        </div>
      </div>

      {/* Dependencies Table */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Dependencies</h2>
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Package</th>
                <th>Version</th>
                <th>Size</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {mockBundleData.dependencies
                .sort((a, b) => b.size - a.size)
                .map((dep) => (
                  <tr key={dep.name}>
                    <td className={styles.packageName}>{dep.name}</td>
                    <td className={styles.version}>{dep.version}</td>
                    <td>{formatBytes(dep.size)}</td>
                    <td>
                      <div className={styles.percentageBar}>
                        <div
                          className={styles.percentageFill}
                          style={{
                            width: `${
                              (dep.size / mockBundleData.totalSize) * 100
                            }%`,
                          }}
                        />
                        <span className={styles.percentageText}>
                          {formatPercentage(
                            (dep.size / mockBundleData.totalSize) * 100
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Optimization Suggestions</h2>
        <div className={styles.suggestionsGrid}>
          {optimizationSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`${styles.suggestionCard} ${styles[suggestion.type]}`}
            >
              <div className={styles.suggestionHeader}>
                <span className={styles.suggestionIcon}>
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <h3 className={styles.suggestionTitle}>{suggestion.title}</h3>
                <span
                  className={styles.impactBadge}
                  style={{ backgroundColor: getImpactColor(suggestion.impact) }}
                >
                  {suggestion.impact}
                </span>
              </div>
              <p className={styles.suggestionDescription}>
                {suggestion.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
