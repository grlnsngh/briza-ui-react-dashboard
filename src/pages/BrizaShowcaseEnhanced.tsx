/**
 * Enhanced Briza UI Showcase Page
 *
 * Demonstrates ALL Briza UI components (real + simulated) with automatic performance monitoring.
 * Shows 20+ components to provide comprehensive monitoring data.
 */

import { useState } from "react";
import { MonitoredComponent } from "../components/MonitoredComponent";
import { ComponentLoadingIndicator } from "../components/common";
import { BRIZA_UI_COMPONENTS_EXPECTED } from "../utils/constants";
import styles from "./BrizaShowcase.module.css";

export default function BrizaShowcaseEnhanced() {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [selectedTab, setSelectedTab] = useState(0);
  const [checkboxStates, setCheckboxStates] = useState([false, false, false]);
  const [showModal, setShowModal] = useState(false);
  const [radioValue, setRadioValue] = useState("option1");
  const [switchStates, setSwitchStates] = useState([false, false]);
  const [selectValue, setSelectValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState(50);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState([false, false, false]);
  const [progress, setProgress] = useState(60);
  const [forceRenderCount, setForceRenderCount] = useState(0);

  // Stress test functions
  const handleStressTest = () => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => setForceRenderCount((prev) => prev + 1), i * 100);
    }
  };

  const handleRapidClicks = () => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => setButtonClicks((prev) => prev + 1), i * 50);
    }
  };

  const handleProgressAnimation = () => {
    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setTimeout(() => setProgress(60), 500);
      }
    }, 100);
  };

  return (
    <div className={styles.container}>
      {/* Component Loading Indicator */}
      <ComponentLoadingIndicator
        expectedCount={BRIZA_UI_COMPONENTS_EXPECTED}
        timeout={5000}
      />

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Briza UI Component Library</h1>
          <p className={styles.subtitle}>
            22 Library Components with Real-time Performance Monitoring
          </p>
        </div>
        <div className={styles.stats}>
          <div className={styles.statBadge}>
            <span className={styles.statLabel}>Renders:</span>
            <span className={styles.statValue}>{forceRenderCount}</span>
          </div>
        </div>
      </div>

      {/* Stress Test Controls */}
      <div className={styles.stressControls}>
        <h2 className={styles.sectionTitle}>🧪 Stress Testing</h2>
        <p className={styles.sectionDesc}>
          Generate performance data by triggering multiple renders
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={handleStressTest} className={styles.stressButton}>
            ⚡ 10 Re-renders
          </button>
          <button onClick={handleRapidClicks} className={styles.stressButton}>
            🔥 20 Rapid Clicks
          </button>
          <button
            onClick={handleProgressAnimation}
            className={styles.stressButton}
          >
            📊 Animate Progress
          </button>
        </div>
      </div>

      {/* Component Grid */}
      <div className={styles.componentsGrid}>
        {/* 1. Button */}
        <MonitoredComponent name="Briza-Button">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Button</h3>
            <p className={styles.componentDesc}>Clicks: {buttonClicks}</p>
            <div className={styles.componentDemo}>
              <button
                className={styles.demoButton}
                onClick={() => setButtonClicks((prev) => prev + 1)}
              >
                Primary ({buttonClicks})
              </button>
              <button
                className={`${styles.demoButton} ${styles.secondary}`}
                onClick={() => setButtonClicks(0)}
              >
                Secondary
              </button>
            </div>
          </div>
        </MonitoredComponent>

        {/* 2. Input */}
        <MonitoredComponent name="Briza-Input">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Input</h3>
            <p className={styles.componentDesc}>Length: {inputValue.length}</p>
            <div className={styles.componentDemo}>
              <input
                className={styles.demoInput}
                type="text"
                placeholder="Type here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>
        </MonitoredComponent>

        {/* 3. Card */}
        <MonitoredComponent name="Briza-Card">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Card</h3>
            <p className={styles.componentDesc}>Container component</p>
            <div className={styles.componentDemo}>
              <div className={styles.demoCard}>
                <div className={styles.cardHeader}>Card Title</div>
                <div className={styles.cardBody}>Card content goes here</div>
              </div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 4. Checkbox */}
        <MonitoredComponent name="Briza-Checkbox">
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
        </MonitoredComponent>

        {/* 5. Tabs */}
        <MonitoredComponent name="Briza-Tabs">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Tabs</h3>
            <p className={styles.componentDesc}>Current: {selectedTab + 1}</p>
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
              <div className={styles.tabContent}>Content {selectedTab + 1}</div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 6. Modal */}
        <MonitoredComponent name="Briza-Modal">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Modal</h3>
            <p className={styles.componentDesc}>
              {showModal ? "Open" : "Closed"}
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
                      <h4>Modal</h4>
                      <button
                        className={styles.modalClose}
                        onClick={() => setShowModal(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.modalBody}>Modal content</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </MonitoredComponent>

        {/* 7. Radio */}
        <MonitoredComponent name="Briza-Radio">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Radio</h3>
            <p className={styles.componentDesc}>Selected: {radioValue}</p>
            <div className={styles.componentDemo}>
              {["option1", "option2", "option3"].map((value) => (
                <label key={value} className={styles.checkboxLabel}>
                  <input
                    type="radio"
                    name="radio"
                    value={value}
                    checked={radioValue === value}
                    onChange={(e) => setRadioValue(e.target.value)}
                  />
                  <span>Option {value.slice(-1)}</span>
                </label>
              ))}
            </div>
          </div>
        </MonitoredComponent>

        {/* 8. Switch */}
        <MonitoredComponent name="Briza-Switch">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Switch</h3>
            <p className={styles.componentDesc}>
              Active: {switchStates.filter(Boolean).length}/2
            </p>
            <div className={styles.componentDemo}>
              {["Switch 1", "Switch 2"].map((label, index) => (
                <label key={index} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={switchStates[index]}
                    onChange={(e) => {
                      const newStates = [...switchStates];
                      newStates[index] = e.target.checked;
                      setSwitchStates(newStates);
                    }}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </MonitoredComponent>

        {/* 9. Select */}
        <MonitoredComponent name="Briza-Select">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Select</h3>
            <p className={styles.componentDesc}>Value: {selectValue}</p>
            <div className={styles.componentDemo}>
              <select
                className={styles.demoInput}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>
          </div>
        </MonitoredComponent>

        {/* 10. Slider */}
        <MonitoredComponent name="Briza-Slider">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Slider</h3>
            <p className={styles.componentDesc}>Value: {sliderValue}</p>
            <div className={styles.componentDemo}>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </MonitoredComponent>

        {/* 11. Badge */}
        <MonitoredComponent name="Briza-Badge">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Badge</h3>
            <p className={styles.componentDesc}>Notification indicator</p>
            <div className={styles.componentDemo}>
              <span className={styles.badge}>New</span>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                {buttonClicks}
              </span>
            </div>
          </div>
        </MonitoredComponent>

        {/* 12. Avatar */}
        <MonitoredComponent name="Briza-Avatar">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Avatar</h3>
            <p className={styles.componentDesc}>User profile picture</p>
            <div className={styles.componentDemo}>
              <div className={styles.avatar}>GS</div>
              <div className={styles.avatar}>JD</div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 13. Tooltip */}
        <MonitoredComponent name="Briza-Tooltip">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Tooltip</h3>
            <p className={styles.componentDesc}>Hover for info</p>
            <div className={styles.componentDemo}>
              <button
                className={styles.demoButton}
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                Hover Me
              </button>
              {tooltipVisible && (
                <div className={styles.tooltip}>Tooltip text</div>
              )}
            </div>
          </div>
        </MonitoredComponent>

        {/* 14. Dropdown */}
        <MonitoredComponent name="Briza-Dropdown">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Dropdown</h3>
            <p className={styles.componentDesc}>Menu selector</p>
            <div className={styles.componentDemo}>
              <button
                className={styles.demoButton}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {dropdownOpen ? "Close" : "Open"} Menu
              </button>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <div>Item 1</div>
                  <div>Item 2</div>
                  <div>Item 3</div>
                </div>
              )}
            </div>
          </div>
        </MonitoredComponent>

        {/* 15. Alert */}
        <MonitoredComponent name="Briza-Alert">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Alert</h3>
            <p className={styles.componentDesc}>Notification message</p>
            <div className={styles.componentDemo}>
              <div className={styles.alert}>ℹ️ This is an alert message</div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 16. Accordion */}
        <MonitoredComponent name="Briza-Accordion">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Accordion</h3>
            <p className={styles.componentDesc}>
              Open: {accordionOpen.filter(Boolean).length}/3
            </p>
            <div className={styles.componentDemo}>
              {["Section 1", "Section 2", "Section 3"].map((label, index) => (
                <div key={index} className={styles.accordionItem}>
                  <button
                    className={styles.accordionHeader}
                    onClick={() => {
                      const newStates = [...accordionOpen];
                      newStates[index] = !newStates[index];
                      setAccordionOpen(newStates);
                    }}
                  >
                    {label}
                  </button>
                  {accordionOpen[index] && (
                    <div className={styles.accordionContent}>
                      Content for {label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </MonitoredComponent>

        {/* 17. Progress */}
        <MonitoredComponent name="Briza-Progress">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Progress</h3>
            <p className={styles.componentDesc}>{progress}%</p>
            <div className={styles.componentDemo}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 18. Spinner */}
        <MonitoredComponent name="Briza-Spinner">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Spinner</h3>
            <p className={styles.componentDesc}>Loading indicator</p>
            <div className={styles.componentDemo}>
              <div className={styles.spinner} />
            </div>
          </div>
        </MonitoredComponent>

        {/* 19. Breadcrumb */}
        <MonitoredComponent name="Briza-Breadcrumb">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Breadcrumb</h3>
            <p className={styles.componentDesc}>Navigation trail</p>
            <div className={styles.componentDemo}>
              <div className={styles.breadcrumb}>
                Home / Components / Breadcrumb
              </div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 20. Pagination */}
        <MonitoredComponent name="Briza-Pagination">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Pagination</h3>
            <p className={styles.componentDesc}>Page navigation</p>
            <div className={styles.componentDemo}>
              <div className={styles.pagination}>
                <button className={styles.paginationBtn}>←</button>
                <button className={`${styles.paginationBtn} ${styles.active}`}>
                  1
                </button>
                <button className={styles.paginationBtn}>2</button>
                <button className={styles.paginationBtn}>3</button>
                <button className={styles.paginationBtn}>→</button>
              </div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 21. Skeleton */}
        <MonitoredComponent name="Briza-Skeleton">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Skeleton</h3>
            <p className={styles.componentDesc}>Loading placeholder</p>
            <div className={styles.componentDemo}>
              <div className={styles.skeleton} />
              <div className={styles.skeleton} style={{ width: "70%" }} />
            </div>
          </div>
        </MonitoredComponent>

        {/* 22. Toast */}
        <MonitoredComponent name="Briza-Toast">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Toast</h3>
            <p className={styles.componentDesc}>Temporary notification</p>
            <div className={styles.componentDemo}>
              <div className={styles.toast}>✅ Success toast message</div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 23. Divider */}
        <MonitoredComponent name="Briza-Divider">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Divider</h3>
            <p className={styles.componentDesc}>Content separator</p>
            <div className={styles.componentDemo}>
              <div>Content above</div>
              <hr className={styles.divider} />
              <div>Content below</div>
            </div>
          </div>
        </MonitoredComponent>

        {/* 24. Table */}
        <MonitoredComponent name="Briza-Table">
          <div className={styles.componentCard}>
            <h3 className={styles.componentTitle}>Table</h3>
            <p className={styles.componentDesc}>Data grid</p>
            <div className={styles.componentDemo}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Item 1</td>
                    <td>{buttonClicks}</td>
                  </tr>
                  <tr>
                    <td>Item 2</td>
                    <td>{forceRenderCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </MonitoredComponent>
      </div>
    </div>
  );
}
