/**
 * Web Vitals
 *
 * The browser's own loading and interactivity measurements for this page.
 *
 * Two things shape the design. First, several of these metrics genuinely
 * cannot be known yet — INP needs an interaction, CLS needs a shift to have
 * happened — so "not measured" is a first-class state here rather than a zero.
 * Second, each value is meaningless without its threshold, so every card shows
 * the budget it is being judged against.
 */

import { useState, useEffect, useMemo } from "react";
import { usePerformanceState } from "../contexts";
import { useCoreWebVitals } from "../hooks";
import { formatDuration } from "../utils";
import {
  PageHeader,
  Panel,
  Badge,
  StatusDot,
  Icon,
  LoadingSkeleton,
  type Tone,
} from "../components/common";
import styles from "./WebVitals.module.css";

type Rating = "good" | "needs-improvement" | "poor";

interface VitalReading {
  value: number;
  rating: Rating;
}

const ratingTone: Record<Rating, Tone> = {
  good: "good",
  "needs-improvement": "warn",
  poor: "bad",
};

const ratingLabel: Record<Rating, string> = {
  good: "Good",
  "needs-improvement": "Needs work",
  poor: "Poor",
};

interface VitalSpec {
  key: string;
  abbr: string;
  name: string;
  budget: string;
  /** Why this metric exists, in one sentence. */
  meaning: string;
  /** Shown when the metric has no value yet, explaining why. */
  pending: string;
  format: (value: number) => string;
}

const specs: VitalSpec[] = [
  {
    key: "lcp",
    abbr: "LCP",
    name: "Largest Contentful Paint",
    budget: "< 2.5s",
    meaning:
      "When the largest element in the viewport finishes rendering — the point the page looks loaded.",
    pending: "Waiting for the largest element to settle.",
    format: formatDuration,
  },
  {
    key: "inp",
    abbr: "INP",
    name: "Interaction to Next Paint",
    budget: "< 200ms",
    meaning:
      "The slowest response between an interaction and the frame that reflects it.",
    pending: "Needs an interaction — click, tap or press a key.",
    format: formatDuration,
  },
  {
    key: "cls",
    abbr: "CLS",
    name: "Cumulative Layout Shift",
    budget: "< 0.1",
    meaning:
      "How much visible content moves unexpectedly while the page loads.",
    pending: "No layout shift recorded, which is the ideal result.",
    format: (value) => value.toFixed(3),
  },
  {
    key: "fcp",
    abbr: "FCP",
    name: "First Contentful Paint",
    budget: "< 1.8s",
    meaning: "When the first text or image appears — the page's first sign of life.",
    pending: "Waiting for the first paint.",
    format: formatDuration,
  },
  {
    key: "ttfb",
    abbr: "TTFB",
    name: "Time to First Byte",
    budget: "< 800ms",
    meaning: "How long the server took to start responding.",
    pending: "Waiting for navigation timing.",
    format: formatDuration,
  },
];

export default function WebVitals() {
  const { dashboard } = usePerformanceState();
  const { lcp, cls, fcp, ttfb, inp, overallScore, isMonitoring } =
    useCoreWebVitals({
      enableRealtime: dashboard.isRealTimeEnabled,
    });

  const [isLoading, setIsLoading] = useState(true);

  // Web Vitals arrive asynchronously and some never arrive at all. After eight
  // seconds, stop implying that more is coming.
  useEffect(() => {
    if (lcp || fcp || ttfb) {
      setIsLoading(false);
      return;
    }
    const timer = setTimeout(() => setIsLoading(false), 8000);
    return () => clearTimeout(timer);
  }, [lcp, fcp, ttfb]);

  const readings = useMemo(
    () =>
      ({ lcp, inp, cls, fcp, ttfb } as Record<string, VitalReading | null>),
    [lcp, inp, cls, fcp, ttfb]
  );

  const measured = specs.filter((spec) => readings[spec.key]).length;
  const failing = specs.filter(
    (spec) => readings[spec.key]?.rating === "poor"
  ).length;
  const collecting = isLoading && isMonitoring;

  const scoreTone: Tone =
    overallScore >= 90 ? "good" : overallScore >= 70 ? "warn" : "bad";

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Analyze"
        title="Core Web Vitals"
        description="Measured by this browser for the current page load, not sampled from field data."
        actions={
          isMonitoring ? (
            <StatusDot tone="good" pulse>
              Measuring
            </StatusDot>
          ) : (
            <StatusDot tone="neutral">Paused</StatusDot>
          )
        }
      />

      {!isMonitoring && (
        <div className={styles.notice}>
          <Icon name="info" size={15} className={styles.noticeIcon} />
          <div>
            <strong className={styles.noticeTitle}>Monitoring is paused.</strong>{" "}
            Web Vitals are only collected while monitoring is on — resume it from
            the header to start measuring this page load.
          </div>
        </div>
      )}

      <div className={styles.summary}>
        <div className={styles.score}>
          <div className={styles.scoreLabel}>Overall</div>
          <div
            className={`${styles.scoreValue} ${
              styles[`score-${scoreTone}`]
            } tabular`}
          >
            {overallScore > 0 ? Math.round(overallScore) : "—"}
          </div>
          <div className={styles.scoreMeta}>
            {overallScore > 0
              ? `${measured} of ${specs.length} metrics measured`
              : collecting
              ? "Collecting…"
              : "Not enough data yet"}
          </div>
        </div>

        <div className={styles.summaryNote}>
          {failing > 0 ? (
            <>
              <Badge tone="bad">{failing} poor</Badge>
              <p>
                {failing === 1 ? "One metric is" : `${failing} metrics are`}{" "}
                outside its budget. The cards below show the measured value
                against the threshold it is judged by.
              </p>
            </>
          ) : measured > 0 ? (
            <>
              <Badge tone="good">Within budget</Badge>
              <p>
                Every measured metric is inside its threshold. Metrics still
                showing a dash have not been triggered yet — that is expected
                for interaction-dependent ones.
              </p>
            </>
          ) : (
            <p>
              Metrics appear as the browser reports them. Scrolling settles LCP;
              clicking or pressing a key is what produces an INP reading.
            </p>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {specs.map((spec) => {
          const reading = readings[spec.key];

          return (
            <div className={styles.vital} key={spec.key}>
              <div className={styles.vitalHead}>
                <div className={styles.vitalNames}>
                  <span className={styles.vitalAbbr}>{spec.abbr}</span>
                  <span className={styles.vitalName}>{spec.name}</span>
                </div>
                {reading ? (
                  <Badge tone={ratingTone[reading.rating]}>
                    {ratingLabel[reading.rating]}
                  </Badge>
                ) : (
                  <Badge tone="neutral">
                    {collecting ? "Measuring" : "No data"}
                  </Badge>
                )}
              </div>

              <div className={styles.vitalValue}>
                {reading ? (
                  <span
                    className={`${styles.vitalNumber} ${
                      styles[`value-${ratingTone[reading.rating]}`]
                    } tabular`}
                  >
                    {spec.format(reading.value)}
                  </span>
                ) : collecting ? (
                  <LoadingSkeleton width="84px" height="26px" />
                ) : (
                  <span className={`${styles.vitalNumber} ${styles.vitalAbsent}`}>
                    —
                  </span>
                )}
                <span className={styles.vitalBudget}>Budget {spec.budget}</span>
              </div>

              <p className={styles.vitalMeaning}>
                {reading ? spec.meaning : spec.pending}
              </p>
            </div>
          );
        })}
      </div>

      <Panel
        title="Reading these numbers"
        description="Each metric answers a different question about how the page felt to load."
      >
        <dl className={styles.glossary}>
          {specs.map((spec) => (
            <div className={styles.glossaryItem} key={spec.key}>
              <dt className={styles.glossaryTerm}>
                <span className={styles.glossaryAbbr}>{spec.abbr}</span>
                {spec.name}
                <span className={styles.glossaryBudget}>{spec.budget}</span>
              </dt>
              <dd className={styles.glossaryBody}>{spec.meaning}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
