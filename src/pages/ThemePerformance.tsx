/**
 * Theme Performance
 *
 * A comparison of styling approaches and what each costs at theme-switch time.
 * These are reference benchmarks rather than measurements of this app, which
 * the page states plainly — the rest of the dashboard reports live numbers and
 * the difference has to be visible.
 */

import { useState } from "react";
import { PerformanceBarChart } from "../components/charts";
import {
  PageHeader,
  Panel,
  Metric,
  Badge,
  Icon,
  type Tone,
  type IconName,
} from "../components/common";
import styles from "./ThemePerformance.module.css";

interface Approach {
  name: string;
  firstPaint: number;
  themeSwitch: number;
  renderTime: number;
  bundleSize: number;
  rating: "excellent" | "good" | "fair";
  pros: string[];
  cons: string[];
}

const stylingApproaches: Approach[] = [
  {
    name: "CSS Modules",
    firstPaint: 125,
    themeSwitch: 45,
    renderTime: 8.2,
    bundleSize: 145,
    rating: "excellent",
    pros: ["Zero runtime cost", "Scoped by default", "Type-safe with TypeScript"],
    cons: ["No dynamic theming", "Build step required"],
  },
  {
    name: "CSS-in-JS (Emotion)",
    firstPaint: 168,
    themeSwitch: 89,
    renderTime: 12.5,
    bundleSize: 234,
    rating: "good",
    pros: ["Dynamic theming", "Scoped styles", "Co-located with components"],
    cons: ["Runtime overhead", "Larger bundle", "Serialisation on every render"],
  },
  {
    name: "Styled Components",
    firstPaint: 172,
    themeSwitch: 95,
    renderTime: 13.8,
    bundleSize: 256,
    rating: "good",
    pros: ["Mature ecosystem", "Dynamic styling", "Strong developer experience"],
    cons: ["Runtime cost", "Bundle size", "SSR setup is involved"],
  },
  {
    name: "Tailwind CSS",
    firstPaint: 132,
    themeSwitch: 52,
    renderTime: 9.1,
    bundleSize: 178,
    rating: "excellent",
    pros: ["Utility-first", "Small once purged", "Fast to iterate"],
    cons: ["Learning curve", "Verbose markup", "Custom design systems take work"],
  },
  {
    name: "Vanilla CSS",
    firstPaint: 118,
    themeSwitch: 38,
    renderTime: 7.5,
    bundleSize: 120,
    rating: "excellent",
    pros: ["Fastest available", "No dependencies", "Universal support"],
    cons: ["No scoping", "Manual optimisation", "Harder to maintain at scale"],
  },
];

const bestPractices: {
  icon: IconName;
  title: string;
  description: string;
  impact: "High" | "Medium" | "Low";
}[] = [
  {
    icon: "bolt",
    title: "Theme with CSS custom properties",
    description:
      "Swapping variable values repaints without re-rendering the tree, so a theme switch costs nothing in JavaScript.",
    impact: "High",
  },
  {
    icon: "package",
    title: "Generate styles at build time",
    description:
      "Anything computed during render is paid for on every render. Pre-generate what you can.",
    impact: "High",
  },
  {
    icon: "contrast",
    title: "Ship one theme at a time",
    description:
      "Loading only the active theme cuts the initial CSS payload and the time spent parsing it.",
    impact: "Medium",
  },
  {
    icon: "layers",
    title: "Load theme variants on demand",
    description:
      "Alternative themes are rarely used in a session — fetch them when chosen rather than bundling all of them.",
    impact: "Medium",
  },
  {
    icon: "checkCircle",
    title: "Persist the theme choice",
    description:
      "Reading the stored preference before first paint avoids the flash of the wrong theme on load.",
    impact: "Low",
  },
  {
    icon: "search",
    title: "Avoid inline styles",
    description:
      "Inline styles defeat browser style caching and grow the HTML payload on every element.",
    impact: "Medium",
  },
];

const ratingTone: Record<Approach["rating"], Tone> = {
  excellent: "good",
  good: "info",
  fair: "warn",
};

const impactTone: Record<string, Tone> = {
  High: "good",
  Medium: "warn",
  Low: "info",
};

export default function ThemePerformance() {
  const [selected, setSelected] = useState<string>("CSS Modules");

  // First paint and theme switch share a range (38-172ms); render time sits an
  // order of magnitude below at 7-14ms. Plotting all three on one linear axis
  // flattens render time into an invisible stub, so it is reported per approach
  // in the table below instead of being drawn against a scale it cannot use.
  const timingData = stylingApproaches.map((approach) => ({
    name: approach.name,
    "First paint": approach.firstPaint,
    "Theme switch": approach.themeSwitch,
  }));

  const sizeData = stylingApproaches.map((approach) => ({
    name: approach.name,
    Size: approach.bundleSize,
  }));

  const current = stylingApproaches[0];
  const fastest = stylingApproaches.reduce((best, approach) =>
    approach.themeSwitch < best.themeSwitch ? approach : best
  );

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Analyze"
        title="Theme Performance"
        description="What each styling approach costs at first paint, at theme-switch time and in shipped bytes."
        actions={<Badge tone="neutral">Reference benchmarks</Badge>}
      />

      <div className={styles.readings}>
        <div className={styles.reading}>
          <Metric
            label="This dashboard uses"
            value={current.name}
            context="Scoped at build time, no runtime cost"
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="Theme switch"
            value={current.themeSwitch}
            unit="ms"
            status="good"
            context={
              current.name === fastest.name
                ? "Fastest of the approaches compared"
                : `${fastest.name} is ${current.themeSwitch - fastest.themeSwitch}ms faster`
            }
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="First paint"
            value={current.firstPaint}
            unit="ms"
            context="Time to first styled frame"
          />
        </div>
        <div className={styles.reading}>
          <Metric
            label="CSS payload"
            value={current.bundleSize}
            unit="KB"
            context="Uncompressed stylesheet weight"
          />
        </div>
      </div>

      <div className={styles.charts}>
        <Panel
          title="Timing"
          description="Lower is better. Render time is reported per approach below."
        >
          <PerformanceBarChart
            data={timingData}
            bars={[
              { dataKey: "First paint", name: "First paint" },
              { dataKey: "Theme switch", name: "Theme switch" },
            ]}
            height={260}
            showLegend
            valueFormatter={(value) => `${value}ms`}
          />
        </Panel>

        <Panel title="Stylesheet size" description="Uncompressed, in kilobytes.">
          <PerformanceBarChart
            data={sizeData}
            bars={[{ dataKey: "Size", name: "Size" }]}
            height={260}
            valueFormatter={(value) => `${value} KB`}
          />
        </Panel>
      </div>

      <Panel
        flush
        title="Approaches"
        description="Select one to read the trade-offs."
      >
        <div className={styles.approaches}>
          {stylingApproaches.map((approach) => {
            const open = selected === approach.name;
            return (
              <div
                key={approach.name}
                className={`${styles.approach} ${open ? styles.approachOpen : ""}`}
              >
                <button
                  className={styles.approachHead}
                  onClick={() => setSelected(open ? "" : approach.name)}
                  aria-expanded={open}
                >
                  <Icon
                    name="chevronRight"
                    size={13}
                    className={styles.approachChevron}
                  />
                  <span className={styles.approachName}>{approach.name}</span>

                  <span className={styles.approachStats}>
                    <span className={`${styles.approachStat} tabular`}>
                      <span className={styles.approachStatLabel}>Paint</span>
                      {approach.firstPaint}ms
                    </span>
                    <span className={`${styles.approachStat} tabular`}>
                      <span className={styles.approachStatLabel}>Switch</span>
                      {approach.themeSwitch}ms
                    </span>
                    <span className={`${styles.approachStat} tabular`}>
                      <span className={styles.approachStatLabel}>Render</span>
                      {approach.renderTime}ms
                    </span>
                    <span className={`${styles.approachStat} tabular`}>
                      <span className={styles.approachStatLabel}>Size</span>
                      {approach.bundleSize}KB
                    </span>
                  </span>

                  <Badge tone={ratingTone[approach.rating]}>
                    {approach.rating}
                  </Badge>
                </button>

                {open && (
                  <div className={styles.approachBody}>
                    <div>
                      <div className={styles.listLabel}>Strengths</div>
                      <ul className={styles.list}>
                        {approach.pros.map((pro) => (
                          <li key={pro} className={styles.listItem}>
                            <Icon
                              name="check"
                              size={12}
                              className={styles.listIconGood}
                            />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className={styles.listLabel}>Trade-offs</div>
                      <ul className={styles.list}>
                        {approach.cons.map((con) => (
                          <li key={con} className={styles.listItem}>
                            <Icon
                              name="close"
                              size={12}
                              className={styles.listIconBad}
                            />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Practices"
        description="Ordered by what they save rather than by effort."
      >
        <div className={styles.practices}>
          {bestPractices.map((practice) => (
            <div className={styles.practice} key={practice.title}>
              <span className={styles.practiceIcon}>
                <Icon name={practice.icon} size={15} />
              </span>
              <div className={styles.practiceText}>
                <div className={styles.practiceHead}>
                  <h3 className={styles.practiceTitle}>{practice.title}</h3>
                  <Badge tone={impactTone[practice.impact] ?? "neutral"}>
                    {practice.impact}
                  </Badge>
                </div>
                <p className={styles.practiceBody}>{practice.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
