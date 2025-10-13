/**
 * Empty State Component
 *
 * Displays a friendly message when no data is available.
 * Provides clear guidance on what users should do next.
 *
 * @example
 * ```tsx
 * import { EmptyState } from '@components/common';
 *
 * function Dashboard() {
 *   if (totalComponents === 0) {
 *     return (
 *       <EmptyState
 *         icon="📊"
 *         title="No Components Monitored"
 *         description="Start monitoring components to see performance metrics"
 *         actionLabel="View Showcase"
 *         onAction={() => navigate('/showcase')}
 *       />
 *     );
 *   }
 * }
 * ```
 */

import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  /** Emoji or icon to display */
  icon?: ReactNode;
  /** Main title */
  title: string;
  /** Descriptive text */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action button handler */
  onAction?: () => void;
  /** Optional secondary action button label */
  secondaryActionLabel?: string;
  /** Optional secondary action button handler */
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.content}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>

        {(actionLabel || secondaryActionLabel) && (
          <div className={styles.actions}>
            {actionLabel && onAction && (
              <button
                className={styles.primaryButton}
                onClick={onAction}
                aria-label={actionLabel}
              >
                {actionLabel}
              </button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <button
                className={styles.secondaryButton}
                onClick={onSecondaryAction}
                aria-label={secondaryActionLabel}
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
