/**
 * Panel
 *
 * The one container in the app. A 1px border and a flat surface — no drop
 * shadow, because a shadow implies the panel floats above the page and none of
 * them do. Depth is reserved for things that genuinely overlay: the alert
 * drawer, popovers, the demo control.
 *
 * `flush` removes body padding for panels whose child manages its own edges,
 * such as a table that needs its header row to meet the panel border.
 */

import type { ReactNode } from "react";
import styles from "./Surface.module.css";

interface PanelProps {
  title?: ReactNode;
  /** Sits under the title. One short sentence — this is not a place for prose. */
  description?: ReactNode;
  /** Controls aligned to the right of the panel header. */
  actions?: ReactNode;
  /** Drop body padding, for tables and charts that own their own edges. */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export function Panel({
  title,
  description,
  actions,
  flush = false,
  className = "",
  children,
}: PanelProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <section className={`${styles.panel} ${className}`}>
      {hasHeader && (
        <header className={styles.panelHead}>
          <div className={styles.panelHeadText}>
            {title && <h2 className={styles.panelTitle}>{title}</h2>}
            {description && (
              <p className={styles.panelDescription}>{description}</p>
            )}
          </div>
          {actions && <div className={styles.panelActions}>{actions}</div>}
        </header>
      )}
      <div className={flush ? styles.panelBodyFlush : styles.panelBody}>
        {children}
      </div>
    </section>
  );
}
