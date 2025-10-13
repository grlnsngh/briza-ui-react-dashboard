/**
 * Briza UI Showcase Page - Debug Version
 */

import { useState } from "react";
import styles from "./BrizaShowcase.module.css";

export default function BrizaShowcaseTest() {
  const [buttonClicks, setButtonClicks] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Briza UI Component Showcase - TEST</h1>
          <p className={styles.subtitle}>
            Testing if page loads without MonitoredComponent
          </p>
        </div>
      </div>

      <div style={{ padding: "2rem" }}>
        <h2>Basic Test Component</h2>
        <p>If you see this, the page is loading!</p>

        <button
          onClick={() => setButtonClicks((prev) => prev + 1)}
          style={{
            padding: "0.5rem 1rem",
            background: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Click Me ({buttonClicks})
        </button>

        <div style={{ marginTop: "2rem" }}>
          <h3>Debug Info:</h3>
          <ul>
            <li>Button clicks: {buttonClicks}</li>
            <li>Component rendered successfully</li>
            <li>CSS module loaded: {styles.container ? "✅ Yes" : "❌ No"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
