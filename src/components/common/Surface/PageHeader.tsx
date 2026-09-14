/**
 * PageHeader
 *
 * Every page opens the same way: an eyebrow saying which surface you are on,
 * the title, one line of purpose, and controls on the right. Identical
 * structure across routes is what stops navigation from feeling like it lands
 * in a different application each time.
 */

import type { ReactNode } from "react";
import styles from "./Surface.module.css";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className={styles.pageHead}>
      <div className={styles.pageHeadText}>
        {eyebrow && <div className={styles.pageEyebrow}>{eyebrow}</div>}
        <h1 className={styles.pageTitle}>{title}</h1>
        {description && <p className={styles.pageDescription}>{description}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}
