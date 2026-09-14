/**
 * Dashboard
 *
 * The answer to two questions, in order: is the library healthy, and what
 * should I look at first.
 *
 * The four readings across the top are the health answer. The slowest-component
 * list below is the second, and it is deliberately the largest thing on the
 * page: a dashboard that shows only aggregates tells you something is wrong
 * without telling you where.
 */

import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerformanceState, usePerformanceActions } from "../contexts";
import { formatNumber } from "../utils";
import {
  ROUTES,
  BRIZA_UI_COMPONENTS_EXPECTED,
  DASHBOARD_COMPONENTS,
} from "../utils/constants";
import { generateMockComponentData } from "../utils/mockData";
import {
  Panel,
  Metric,
  Badge,
  ScoreBar,
  PageHeader,
  Button,
  Icon,
  DemoModeToggle,
  ComponentLoadingIndicator,
  type MetricStatus,
  type IconName,
} from "../components/common";
import styles from "./Dashboard.module.css";

const destinations: {
  path: string;
  name: string;
  icon: IconName;
  description: string;
}[] = [
  {
    path: ROUTES.COMPONENT_MONITOR,
    name: "Component Monitor",
    icon: "activity",
    description: "Per-component render counts, timings and scores.",
  },
  {
    path: ROUTES.RERENDER_TRACKER,
    name: "Re-render Tracker",
    icon: "repeat",
    description: "Find components rendering more often than their props change.",
  },
  {
    path: ROUTES.BUNDLE_ANALYZER,
    name: "Bundle Analyzer",
    icon: "package",
    description: "Module weight and tree-shaking effectiveness.",
  },
  {
    path: ROUTES.WEB_VITALS,
    name: "Web Vitals",
    icon: "bolt",
    description: "LCP, CLS, INP and TTFB as the browser reports them.",
  },
];

/** Shared thresholds, so the bar, the badge and the tint never disagree. */
function scoreStatus(score: number): MetricStatus {
  if (score >= 90) return "good";
  if (score >= 70) return "warn";
  return "bad";
}

export default function Dashboard() {
  const { componentMetrics, webVitals, dashboard, isDemoMode } =
    usePerformanceState();
  const { toggleDemoMode, loadMockData } = usePerformanceActions();
  const navigate = useNavigate();

  // The dashboard's own chrome is monitored too, but it is not what this
  // page is about.
  const components = useMemo(
    () =>
      Array.from(componentMetrics.values()).filter(
        (metric) =>
          !(DASHBOARD_COMPONENTS as readonly string[]).includes(
            metric.componentName
          )
      ),
    [componentMetrics]
  );

  const tracked = components.length;
  const avgScore = tracked
    ? components.reduce((sum, m) => sum + m.performanceScore, 0) / tracked
    : 0;
  const totalRenders = components.reduce((sum, m) => sum + m.renderCount, 0);

  const slowest = useMemo(
    () =>
      [...components]
        .sort(
          (a, b) =>
            a.performanceScore - b.performanceScore ||
            b.avgRenderTime - a.avgRenderTime
        )
        .slice(0, 8),
    [components]
  );

  const needsAttention = components.filter(
    (m) => m.performanceScore < 70
  ).length;
  const partial =
    !isDemoMode && tracked > 0 && tracked < BRIZA_UI_COMPONENTS_EXPECTED;
  const isLive = dashboard.isRealTimeEnabled;

  const enableDemo = () => {
    toggleDemoMode(true);
    loadMockData(generateMockComponentData());
  };

  return (
    <div className={styles.page}>
      {partial && (
        <ComponentLoadingIndicator
          expectedCount={BRIZA_UI_COMPONENTS_EXPECTED}
          timeout={5000}
        />
      )}

      <PageHeader
        eyebrow="Overview"
        title="Library performance"
        description="Render, bundle and Web Vitals telemetry for briza-ui-react, measured live in this browser."
        actions={<DemoModeToggle />}
      />

      <div className={styles.readings}>
        <div className={styles.reading}>
          <Metric
            size="lg"
            label="Components tracked"
            value={tracked || "—"}
            unit={partial ? `/ ${BRIZA_UI_COMPONENTS_EXPECTED}` : undefined}
            context={
              tracked === 0 ? (
                <Link className={styles.readingLink} to={ROUTES.SHOWCASE}>
                  Mount the library to begin
                </Link>
              ) : partial ? (
                <Link className={styles.readingLink} to={ROUTES.SHOWCASE}>
                  Load the remaining components
                </Link>
              ) : (
                "All expected components mounted"
              )
            }
          />
        </div>

        <div className={styles.reading}>
          <Metric
            size="lg"
            label="Average score"
            value={tracked ? formatNumber(avgScore, 0) : "—"}
            status={tracked ? scoreStatus(avgScore) : "neutral"}
            context={
              tracked
                ? needsAttention > 0
                  ? `${needsAttention} below 70`
                  : "All components above 70"
                : "No measurements yet"
            }
          />
        </div>

        <div className={styles.reading}>
          <Metric
            size="lg"
            label="Renders recorded"
            value={tracked ? formatNumber(totalRenders, 0) : "—"}
            context={
              tracked
                ? `${formatNumber(totalRenders / tracked, 0)} avg per component`
                : "No measurements yet"
            }
          />
        </div>

        <div className={styles.reading}>
          <Metric
            size="lg"
            label="Web Vitals"
            value={
              webVitals && webVitals.overallScore > 0
                ? formatNumber(webVitals.overallScore, 0)
                : "—"
            }
            status={
              webVitals && webVitals.overallScore > 0
                ? scoreStatus(webVitals.overallScore)
                : "neutral"
            }
            context={
              webVitals && webVitals.overallScore > 0 ? (
                <Link className={styles.readingLink} to={ROUTES.WEB_VITALS}>
                  See the breakdown
                </Link>
              ) : isLive ? (
                "Collecting…"
              ) : (
                "Resume monitoring to collect"
              )
            }
          />
        </div>
      </div>

      <div className={styles.split}>
        <Panel
          flush
          title="Needs attention"
          description={
            tracked
              ? "Lowest performance score first, then slowest average render."
              : undefined
          }
          actions={
            tracked > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                iconAfter="arrowRight"
                onClick={() => navigate(ROUTES.COMPONENT_MONITOR)}
              >
                All components
              </Button>
            ) : undefined
          }
        >
          {tracked === 0 ? (
            <div className={styles.blank}>
              <div className={styles.blankIcon}>
                <Icon name="activity" size={18} />
              </div>
              <div className={styles.blankTitle}>Nothing measured yet</div>
              <p className={styles.blankBody}>
                Components report as they mount. Open the showcase to render all{" "}
                {BRIZA_UI_COMPONENTS_EXPECTED} library components, or load a
                sample dataset to see the shape of the data first.
              </p>
              <div className={styles.blankActions}>
                <Button
                  variant="primary"
                  iconAfter="arrowRight"
                  onClick={() => navigate(ROUTES.SHOWCASE)}
                >
                  Open showcase
                </Button>
                <Button onClick={enableDemo}>Load sample data</Button>
              </div>
            </div>
          ) : (
            <div className={styles.board}>
              {slowest.map((metric, index) => (
                <Link
                  key={metric.componentName}
                  to={ROUTES.COMPONENT_MONITOR}
                  className={styles.row}
                >
                  <span className={styles.rank}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className={styles.rowIdentity}>
                    <span className={styles.rowName}>
                      {metric.componentName}
                    </span>
                    <span className={`${styles.rowMeta} tabular`}>
                      {formatNumber(metric.renderCount, 0)} renders
                    </span>
                  </span>

                  <span className={`${styles.rowTime} tabular`}>
                    {metric.avgRenderTime < 0.01
                      ? "<0.01"
                      : formatNumber(metric.avgRenderTime, 2)}
                    ms
                  </span>

                  <span className={styles.rowScore}>
                    <ScoreBar score={metric.performanceScore} />
                    <span className={`${styles.rowScoreValue} tabular`}>
                      {formatNumber(metric.performanceScore, 0)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          flush
          title="Where to look next"
          actions={
            <Badge tone={isLive ? "good" : "neutral"}>
              {isLive ? "Live" : "Paused"}
            </Badge>
          }
        >
          <div className={styles.routes}>
            {destinations.map((destination) => (
              <Link
                key={destination.path}
                to={destination.path}
                className={styles.route}
              >
                <span className={styles.routeIcon}>
                  <Icon name={destination.icon} size={15} />
                </span>
                <span className={styles.routeText}>
                  <span className={styles.routeName}>
                    {destination.name}
                    <Icon
                      name="arrowRight"
                      size={13}
                      className={styles.routeArrow}
                    />
                  </span>
                  <span className={styles.routeDescription}>
                    {destination.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
