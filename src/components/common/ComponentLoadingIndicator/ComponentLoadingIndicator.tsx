/**
 * Component Loading Indicator
 *
 * Shows when components are still being registered/loaded in the showcase.
 * Provides transparency to users about the component discovery process.
 */

import { useEffect, useState } from "react";
import { usePerformanceContext } from "../../../contexts";
import styles from "./ComponentLoadingIndicator.module.css";

interface ComponentLoadingIndicatorProps {
  expectedCount?: number;
  timeout?: number;
}

export function ComponentLoadingIndicator({
  expectedCount = 47,
  timeout = 3000,
}: ComponentLoadingIndicatorProps) {
  const { state } = usePerformanceContext();
  const [isVisible, setIsVisible] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const currentCount = state.componentMetrics.size;
  const isLoading = currentCount < expectedCount && !hasTimedOut;
  const progress = Math.min((currentCount / expectedCount) * 100, 100);

  useEffect(() => {
    // Auto-hide after timeout or when all components are loaded
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      // Fade out after a short delay
      setTimeout(() => setIsVisible(false), 500);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  useEffect(() => {
    // Hide when all components are loaded
    if (currentCount >= expectedCount) {
      setTimeout(() => setIsVisible(false), 1000);
    }
  }, [currentCount, expectedCount]);

  if (!isVisible || !isLoading) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <div className={styles.spinner} />
        </div>
        <div className={styles.info}>
          <h3 className={styles.title}>Discovering Components...</h3>
          <p className={styles.description}>
            {currentCount} of {expectedCount} components loaded
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
