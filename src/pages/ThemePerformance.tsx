/**
 * Theme Performance Page
 *
 * Analyzes theme switching performance and CSS delivery methods.
 * Compares CSS-in-JS vs CSS Modules vs Styled Components.
 */

import { useState } from "react";
import { PerformanceBarChart } from "../components/charts";
import styles from "./ThemePerformance.module.css";

// Mock performance data for different styling approaches
const stylingApproaches = [
  {
    name: "CSS Modules",
    firstPaint: 125,
    themeSwitch: 45,
    renderTime: 8.2,
    bundleSize: 145,
    rating: "excellent",
    pros: [
      "Zero runtime cost",
      "Great performance",
      "Type-safe with TypeScript",
    ],
    cons: ["No dynamic theming", "Build step required"],
  },
  {
    name: "CSS-in-JS (Emotion)",
    firstPaint: 168,
    themeSwitch: 89,
    renderTime: 12.5,
    bundleSize: 234,
    rating: "good",
    pros: ["Dynamic theming", "Scoped styles", "Component co-location"],
    cons: ["Runtime overhead", "Larger bundle", "Can impact performance"],
  },
  {
    name: "Styled Components",
    firstPaint: 172,
    themeSwitch: 95,
    renderTime: 13.8,
    bundleSize: 256,
    rating: "good",
    pros: ["Popular ecosystem", "Dynamic styling", "Great DX"],
    cons: ["Runtime cost", "Bundle size", "SSR complexity"],
  },
  {
    name: "Tailwind CSS",
    firstPaint: 132,
    themeSwitch: 52,
    renderTime: 9.1,
    bundleSize: 178,
    rating: "excellent",
    pros: ["Utility-first", "Small bundle (purged)", "Fast development"],
    cons: ["Learning curve", "Verbose HTML", "Customization can be complex"],
  },
  {
    name: "Vanilla CSS",
    firstPaint: 118,
    themeSwitch: 38,
    renderTime: 7.5,
    bundleSize: 120,
    rating: "excellent",
    pros: ["Maximum performance", "No dependencies", "Universal support"],
    cons: ["No scoping", "Manual optimization", "Harder to maintain"],
  },
];

const bestPractices = [
  {
    icon: "⚡",
    title: "Use CSS Variables for Theming",
    description:
      "CSS custom properties provide near-instant theme switching with zero JavaScript overhead.",
    impact: "High",
  },
  {
    icon: "📦",
    title: "Minimize Runtime CSS Generation",
    description:
      "Pre-generate styles at build time when possible to reduce runtime performance costs.",
    impact: "High",
  },
  {
    icon: "🎨",
    title: "Split Theme Files",
    description:
      "Load only the active theme to reduce initial CSS payload and improve parsing time.",
    impact: "Medium",
  },
  {
    icon: "🚀",
    title: "Lazy Load Theme Variants",
    description:
      "Load alternative themes on-demand rather than bundling all themes upfront.",
    impact: "Medium",
  },
  {
    icon: "💾",
    title: "Cache Theme Preference",
    description:
      "Store user theme preference in localStorage to prevent flash of unstyled content.",
    impact: "Low",
  },
  {
    icon: "🔍",
    title: "Avoid Inline Styles",
    description:
      "Inline styles prevent browser optimizations and increase HTML payload size.",
    impact: "Medium",
  },
];

export default function ThemePerformance() {
  const [selectedApproach, setSelectedApproach] =
    useState<string>("CSS Modules");

  const comparisonData = stylingApproaches.map((approach) => ({
    name: approach.name,
    "First Paint (ms)": approach.firstPaint,
    "Theme Switch (ms)": approach.themeSwitch,
    "Render Time (ms)": approach.renderTime,
  }));

  const bundleSizeData = stylingApproaches.map((approach) => ({
    name: approach.name,
    "Bundle Size (KB)": approach.bundleSize,
  }));

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "var(--color-success)";
      case "good":
        return "var(--color-info)";
      case "fair":
        return "var(--color-warning)";
      default:
        return "var(--text-secondary)";
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case "excellent":
        return "🏆";
      case "good":
        return "✓";
      case "fair":
        return "→";
      default:
        return "✗";
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Theme Performance Analysis</h1>
          <p className={styles.subtitle}>
            Compare styling approaches and optimize theme switching
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Current Method</div>
            <div className={styles.statValue} style={{ fontSize: "1.25rem" }}>
              CSS Modules
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Theme Switch</div>
            <div
              className={styles.statValue}
              style={{ color: "var(--color-success)" }}
            >
              45ms
            </div>
          </div>
        </div>
      </div>

      {/* Performance Comparison Charts */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance Comparison</h2>
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Timing Metrics Comparison</h3>
            <PerformanceBarChart
              data={comparisonData}
              bars={[
                {
                  dataKey: "First Paint (ms)",
                  name: "First Paint",
                  color: "#3b82f6",
                },
                {
                  dataKey: "Theme Switch (ms)",
                  name: "Theme Switch",
                  color: "#10b981",
                },
                {
                  dataKey: "Render Time (ms)",
                  name: "Render Time",
                  color: "#f59e0b",
                },
              ]}
              height={350}
              yAxisLabel="Time (ms)"
            />
          </div>

          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Bundle Size Comparison</h3>
            <PerformanceBarChart
              data={bundleSizeData}
              bars={[
                {
                  dataKey: "Bundle Size (KB)",
                  name: "Bundle Size",
                  color: "#8b5cf6",
                },
              ]}
              height={350}
              yAxisLabel="Size (KB)"
            />
          </div>
        </div>
      </div>

      {/* Styling Approaches */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Styling Approaches</h2>
        <div className={styles.approachesGrid}>
          {stylingApproaches.map((approach) => (
            <div
              key={approach.name}
              className={`${styles.approachCard} ${
                selectedApproach === approach.name ? styles.selected : ""
              }`}
              onClick={() => setSelectedApproach(approach.name)}
            >
              <div className={styles.approachHeader}>
                <h3 className={styles.approachName}>{approach.name}</h3>
                <span
                  className={styles.ratingBadge}
                  style={{ backgroundColor: getRatingColor(approach.rating) }}
                >
                  {getRatingIcon(approach.rating)} {approach.rating}
                </span>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>First Paint</span>
                  <span className={styles.metricValue}>
                    {approach.firstPaint}ms
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Theme Switch</span>
                  <span className={styles.metricValue}>
                    {approach.themeSwitch}ms
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Bundle Size</span>
                  <span className={styles.metricValue}>
                    {approach.bundleSize}KB
                  </span>
                </div>
              </div>

              {selectedApproach === approach.name && (
                <div className={styles.details}>
                  <div className={styles.detailSection}>
                    <h4 className={styles.detailTitle}>Pros</h4>
                    <ul className={styles.detailList}>
                      {approach.pros.map((pro, index) => (
                        <li key={index}>✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.detailSection}>
                    <h4 className={styles.detailTitle}>Cons</h4>
                    <ul className={styles.detailList}>
                      {approach.cons.map((con, index) => (
                        <li key={index}>✗ {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Best Practices</h2>
        <div className={styles.practicesGrid}>
          {bestPractices.map((practice, index) => (
            <div key={index} className={styles.practiceCard}>
              <div className={styles.practiceIcon}>{practice.icon}</div>
              <h3 className={styles.practiceTitle}>{practice.title}</h3>
              <p className={styles.practiceDescription}>
                {practice.description}
              </p>
              <span
                className={styles.impactBadge}
                style={{
                  backgroundColor:
                    practice.impact === "High"
                      ? "var(--color-success)"
                      : practice.impact === "Medium"
                      ? "var(--color-warning)"
                      : "var(--color-info)",
                }}
              >
                {practice.impact} Impact
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
