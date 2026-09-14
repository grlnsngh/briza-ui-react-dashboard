/**
 * Badge and StatusDot
 *
 * Small status carriers. Both pair colour with a word or a shape, never colour
 * alone — a red dot and a green dot are the same dot to a red-green colour
 * blind reader, which is roughly one in twelve of them.
 */

import type { ReactNode } from "react";
import styles from "./Surface.module.css";

export type Tone = "neutral" | "good" | "warn" | "bad" | "info" | "accent";

const toneClass: Record<Tone, string> = {
  neutral: styles.toneNeutral,
  good: styles.toneGood,
  warn: styles.toneWarn,
  bad: styles.toneBad,
  info: styles.toneInfo,
  accent: styles.toneAccent,
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`${styles.badge} ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** A dot plus a label. `pulse` marks a genuinely live reading. */
export function StatusDot({
  tone = "neutral",
  pulse = false,
  children,
}: {
  tone?: Tone;
  pulse?: boolean;
  children?: ReactNode;
}) {
  return (
    <span className={`${styles.status} ${toneClass[tone]}`}>
      <span
        className={`${styles.statusDot} ${pulse ? styles.statusPulse : ""}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

/**
 * Score bar
 *
 * A 0–100 reading rendered as a track. Colour comes from the value, so the
 * bar and the number can never disagree.
 */
export function ScoreBar({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const tone: Tone = clamped >= 90 ? "good" : clamped >= 70 ? "warn" : "bad";

  return (
    <span
      className={styles.scoreBar}
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span
        className={`${styles.scoreFill} ${toneClass[tone]}`}
        style={{ inlineSize: `${clamped}%` }}
      />
    </span>
  );
}
