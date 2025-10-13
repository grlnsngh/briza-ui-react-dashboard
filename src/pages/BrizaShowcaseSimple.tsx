/**
 * Briza UI Showcase Page - Simplified Version
 *
 * Version without MonitoredComponent to test if that's the issue
 */

import { useState, Fragment } from "react";
import styles from "./BrizaShowcase.module.css";

export default function BrizaShowcaseSimple() {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [checkboxStates, setCheckboxStates] = useState([false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const [forceRenderCount, setForceRenderCount] = useState(0);

  // Stress test: Force re-renders
  const handleStressTest = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        setForceRenderCount((prev) => prev + 1);
      }, i * 100);
    }
  };

  // Stress test: Rapid clicks
  const handleRapidClicks = () => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        setButtonClicks((prev) => prev + 1);
      }, i * 50);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Briza UI Component Showcase</h1>
          <p className={styles.subtitle}>
            Real components with automatic performance monitoring
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Force Renders:</span>
            <span className={styles.statValue}>{forceRenderCount}</span>
          </div>
        </div>
      </div>

      {/* Stress Test Controls */}
      <div className={styles.stressControls}>
        <h2 className={styles.sectionTitle}>🧪 Stress Testing</h2>
        <p className={styles.sectionDesc}>
          Generate performance data by triggering multiple renders and
          interactions
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={handleStressTest} className={styles.stressButton}>
            ⚡ Trigger 10 Re-renders
          </button>
          <button onClick={handleRapidClicks} className={styles.stressButton}>
            🔥 20 Rapid Clicks
          </button>
          <button
            onClick={() => {
              setInputValue("");
              setSelectedTab(0);
              setCheckboxStates([false, false, false]);
            }}
            className={styles.stressButton}
          >
            🔄 Reset All
          </button>
        </div>
      </div>

      {/* Component Grid */}
      <div className={styles.componentsGrid}>
        {/* Button Component - WITHOUT MonitoredComponent wrapper */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Button</h3>
            <p className={styles.componentDesc}>
              Click counter: {buttonClicks}
            </p>
            <div className={styles.componentDemo}>
              <button
                className={styles.demoButton}
                onClick={() => setButtonClicks((prev) => prev + 1)}
              >
                Click Me ({buttonClicks})
              </button>
              <button
                className={`${styles.demoButton} ${styles.secondary}`}
                onClick={() => setButtonClicks(0)}
              >
                Reset
              </button>
            </div>
          </div>
        </Fragment>

        {/* Input Component */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Input</h3>
            <p className={styles.componentDesc}>
              Characters: {inputValue.length}
            </p>
            <div className={styles.componentDemo}>
              <input
                className={styles.demoInput}
                type="text"
                placeholder="Type something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </Fragment>

        {/* Card Component */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Card</h3>
            <p className={styles.componentDesc}>Container component</p>
            <div className={styles.componentDemo}>
              <div className={styles.demoCard}>
                <div className={styles.cardHeader}>Card Title</div>
                <div className={styles.cardBody}>
                  This is a card component showcasing content layout.
                </div>
                <div className={styles.cardFooter}>
                  <span>Updated: {forceRenderCount} times</span>
                </div>
              </div>
            </div>
          </div>
        </Fragment>

        {/* Checkbox Component */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Checkbox</h3>
            <p className={styles.componentDesc}>
              Selected: {checkboxStates.filter(Boolean).length}/3
            </p>
            <div className={styles.componentDemo}>
              {["Option 1", "Option 2", "Option 3"].map((label, index) => (
                <label key={index} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={checkboxStates[index]}
                    onChange={(e) => {
                      const newStates = [...checkboxStates];
                      newStates[index] = e.target.checked;
                      setCheckboxStates(newStates);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </Fragment>

        {/* Tabs Component */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Tabs</h3>
            <p className={styles.componentDesc}>
              Current tab: {selectedTab + 1}
            </p>
            <div className={styles.componentDemo}>
              <div className={styles.tabs}>
                {["Tab 1", "Tab 2", "Tab 3"].map((label, index) => (
                  <button
                    key={index}
                    className={`${styles.tab} ${
                      selectedTab === index ? styles.activeTab : ""
                    }`}
                    onClick={() => setSelectedTab(index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.tabContent}>
                Content for {["Tab 1", "Tab 2", "Tab 3"][selectedTab]}
              </div>
            </div>
          </div>
        </Fragment>

        {/* Modal Component */}
        <Fragment>
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Modal</h3>
            <p className={styles.componentDesc}>
              Status: {showModal ? "Open" : "Closed"}
            </p>
            <div className={styles.componentDemo}>
              <button
                className={styles.demoButton}
                onClick={() => setShowModal(true)}
              >
                Open Modal
              </button>
              {showModal && (
                <div className={styles.modalOverlay}>
                  <div className={styles.modal}>
                    <div className={styles.modalHeader}>
                      <h4>Modal Title</h4>
                      <button
                        className={styles.modalClose}
                        onClick={() => setShowModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.modalBody}>
                      This is a modal component. Each open/close triggers a
                      render that's being monitored.
                    </div>
                    <div className={styles.modalFooter}>
                      <button
                        className={styles.demoButton}
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Fragment>
      </div>

      {/* Instructions */}
      <div className={styles.instructions}>
        <h2 className={styles.sectionTitle}>📊 How It Works</h2>
        <div className={styles.instructionsGrid}>
          <div className={styles.instructionCard}>
            <div className={styles.instructionIcon}>⚡</div>
            <h4>Simplified Version</h4>
            <p>
              This version loads WITHOUT the MonitoredComponent wrapper to test
              if that was causing the blank page issue.
            </p>
          </div>
          <div className={styles.instructionCard}>
            <div className={styles.instructionIcon}>📈</div>
            <h4>Components Work</h4>
            <p>
              If you see this page, the components are rendering fine. The issue
              was with the MonitoredComponent wrapper.
            </p>
          </div>
          <div className={styles.instructionCard}>
            <div className={styles.instructionIcon}>🧪</div>
            <h4>Stress Testing</h4>
            <p>
              Use the stress test buttons above to trigger renders. Monitoring
              needs to be re-added.
            </p>
          </div>
          <div className={styles.instructionCard}>
            <div className={styles.instructionIcon}>🎯</div>
            <h4>Next Step</h4>
            <p>
              Once confirmed working, we'll fix the MonitoredComponent to add
              back automatic tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
