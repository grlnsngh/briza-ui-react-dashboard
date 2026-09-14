/**
 * Demo data control
 *
 * Was a floating pill in the bottom-right corner. It is now an inline control
 * in the page header, because a fixed-position button that follows you across
 * every route implies it is always relevant, and it is only relevant when you
 * have no real data yet.
 *
 * When demo data is loaded the trigger states that plainly. Numbers on screen
 * that did not come from a real measurement have to say so — that is the whole
 * reason this control is visible rather than tucked into a settings page.
 */

import { useEffect, useRef, useState } from "react";
import { usePerformanceContext } from "../../../contexts";
import {
  getFullMockDataset,
  generateProblematicComponents,
} from "../../../utils";
import { Icon } from "../Icon";
import styles from "./DemoModeToggle.module.css";

export default function DemoModeToggle() {
  const { state, loadMockData, toggleDemoMode, clearMetrics } =
    usePerformanceContext();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Dismiss on outside click and on Escape. A menu that can only be closed by
  // reselecting its trigger is a trap for keyboard users.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const loadFull = () => {
    loadMockData(getFullMockDataset());
    setOpen(false);
  };

  const loadProblematic = () => {
    loadMockData(generateProblematicComponents());
    setOpen(false);
  };

  const returnToLive = () => {
    toggleDemoMode(false);
    clearMetrics();
    setOpen(false);
  };

  const clear = () => {
    clearMetrics();
    setOpen(false);
  };

  const { isDemoMode } = state;
  const count = state.componentMetrics.size;

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        className={`${styles.trigger} ${isDemoMode ? styles.triggerDemo : ""}`}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {isDemoMode ? (
          <>
            <span className={styles.dot} aria-hidden="true" />
            Sample data
          </>
        ) : (
          <>
            <Icon name="sparkle" size={13} />
            Demo data
          </>
        )}
        <Icon name="chevronDown" size={12} className={styles.caret} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Source</span>
              <strong>{isDemoMode ? "Sample" : "Live measurement"}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Components</span>
              <strong className="tabular">{count}</strong>
            </div>
          </div>

          <div className={styles.group} role="group">
            <button className={styles.item} onClick={loadFull} role="menuitem">
              <span className={styles.itemLabel}>Full dataset</span>
              <span className={styles.itemHint}>20 components</span>
            </button>

            <button
              className={styles.item}
              onClick={loadProblematic}
              role="menuitem"
            >
              <span className={styles.itemLabel}>Problem components</span>
              <span className={styles.itemHint}>3 slow</span>
            </button>
          </div>

          {(isDemoMode || count > 0) && (
            <div className={styles.group} role="group">
              {isDemoMode && (
                <button
                  className={styles.item}
                  onClick={returnToLive}
                  role="menuitem"
                >
                  <span className={styles.itemLabel}>Return to live data</span>
                </button>
              )}
              {count > 0 && (
                <button
                  className={`${styles.item} ${styles.itemDanger}`}
                  onClick={clear}
                  role="menuitem"
                >
                  <span className={styles.itemLabel}>Clear all metrics</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
