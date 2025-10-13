/**
 * Dashboard Page
 *
 * Main dashboard overview showing key performance metrics and summary cards
 */

import { usePerformanceContext } from "../contexts";
import { formatNumber } from "../utils";

export default function Dashboard() {
  const { state } = usePerformanceContext();

  const totalComponents = state.componentMetrics.size;
  const avgScore =
    Array.from(state.componentMetrics.values()).reduce(
      (sum, metric) => sum + metric.performanceScore,
      0
    ) / totalComponents || 0;

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            marginBottom: "0.5rem",
          }}
        >
          Briza UI Performance Dashboard
        </h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Real-time performance monitoring and analytics for briza-ui-react
          component library
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Total Components
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "700" }}>
            {totalComponents}
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Avg Performance Score
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "700" }}>
            {formatNumber(avgScore, 1)}
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Web Vitals Score
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "700" }}>
            {state.webVitals
              ? formatNumber(state.webVitals.overallScore, 1)
              : "-"}
          </div>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-surface)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-secondary)",
              marginBottom: "0.5rem",
            }}
          >
            Monitoring Status
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: state.dashboard.isRealTimeEnabled
                ? "var(--color-success)"
                : "var(--color-text-secondary)",
            }}
          >
            {state.dashboard.isRealTimeEnabled ? "●" : "○"}{" "}
            {state.dashboard.isRealTimeEnabled ? "Active" : "Inactive"}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "2rem",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Welcome to Briza UI Performance Analytics
        </h2>
        <p
          style={{
            color: "var(--color-text-secondary)",
            lineHeight: "1.6",
            marginBottom: "1rem",
          }}
        >
          This dashboard provides comprehensive performance monitoring and
          analytics for the briza-ui-react component library. Built with React
          18+ and modern performance optimization techniques.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1.5rem",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              📊 Component Monitor
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Track render performance and metrics
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              📦 Bundle Analyzer
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Analyze bundle size and tree-shaking
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              ⚡ Web Vitals
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Monitor Core Web Vitals metrics
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              🔄 Re-render Tracker
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Identify unnecessary re-renders
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
