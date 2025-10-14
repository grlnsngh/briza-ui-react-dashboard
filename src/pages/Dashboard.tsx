/**
 * Dashboard Page
 *
 * Main dashboard overview showing key performance metrics and summary cards
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePerformanceContext } from "../contexts";
import { formatNumber } from "../utils";
import {
  ROUTES,
  BRIZA_UI_COMPONENTS_EXPECTED,
  DASHBOARD_COMPONENTS,
} from "../utils/constants";
import { generateMockComponentData } from "../utils/mockData";
import {
  LoadingSkeleton,
  DemoModeToggle,
  EmptyState,
  ComponentLoadingIndicator,
} from "../components/common";

export default function Dashboard() {
  const { state, toggleDemoMode, loadMockData } = usePerformanceContext();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [webVitalsLoading, setWebVitalsLoading] = useState(true);
  const navigate = useNavigate();

  // Filter to only count Briza UI components (exclude dashboard-specific components)
  const brizaUIComponents = Array.from(state.componentMetrics.entries()).filter(
    ([name]) => !(DASHBOARD_COMPONENTS as readonly string[]).includes(name)
  );
  const totalComponents = brizaUIComponents.length;

  // Calculate average score only from Briza UI components
  const avgScore =
    brizaUIComponents.reduce(
      (sum, [, metric]) => sum + metric.performanceScore,
      0
    ) / totalComponents || 0;

  // Check if data is loading
  useEffect(() => {
    // After 2 seconds, consider initial load complete
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Check if web vitals are still loading
  useEffect(() => {
    if (state.webVitals && state.webVitals.overallScore > 0) {
      setWebVitalsLoading(false);
    } else if (state.dashboard.isRealTimeEnabled) {
      // If monitoring is active, keep showing loading
      setWebVitalsLoading(true);
      // After 10 seconds, stop showing loading
      const timer = setTimeout(() => {
        setWebVitalsLoading(false);
      }, 10000);
      return () => clearTimeout(timer);
    } else {
      setWebVitalsLoading(false);
    }
  }, [state.webVitals, state.dashboard.isRealTimeEnabled]);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Component Loading Indicator - Shows when components are being discovered */}
      {!state.isDemoMode &&
        totalComponents > 0 &&
        totalComponents < BRIZA_UI_COMPONENTS_EXPECTED && (
          <ComponentLoadingIndicator
            expectedCount={BRIZA_UI_COMPONENTS_EXPECTED}
            timeout={5000}
          />
        )}

      <header
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "2rem",
        }}
      >
        <div style={{ flex: 1 }}>
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
        </div>
        <DemoModeToggle />
      </header>

      {/* Empty State - Show when no data */}
      {totalComponents === 0 && !isInitialLoad && !state.isDemoMode && (
        <EmptyState
          icon="📊"
          title="No Components Monitored Yet"
          description="Components need to mount first to be tracked. Visit the Component Showcase page to load all 22 Briza UI library components, or enable Demo Mode to see sample data immediately."
          actionLabel="Load Components →"
          onAction={() => navigate(ROUTES.SHOWCASE)}
          secondaryActionLabel="Enable Demo Mode"
          onSecondaryAction={() => {
            // Enable demo mode and load mock data
            toggleDemoMode(true);
            const mockData = generateMockComponentData();
            loadMockData(mockData);
          }}
        />
      )}

      {/* Loading State during initial load */}
      {totalComponents === 0 && isInitialLoad && !state.isDemoMode && (
        <div style={{ marginBottom: "2rem" }}>
          <LoadingSkeleton height="200px" />
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {/* Total Components Card */}
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
            {!state.isDemoMode &&
            totalComponents > 0 &&
            totalComponents < BRIZA_UI_COMPONENTS_EXPECTED ? (
              <>
                {totalComponents}{" "}
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "1.5rem",
                  }}
                >
                  / {BRIZA_UI_COMPONENTS_EXPECTED}
                </span>
              </>
            ) : (
              totalComponents
            )}
          </div>
          {totalComponents === 0 && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--color-warning)",
              }}
            >
              <Link
                to={ROUTES.SHOWCASE}
                style={{
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                Visit Showcase →
              </Link>{" "}
              to start monitoring
            </div>
          )}
          {!state.isDemoMode &&
            totalComponents > 0 &&
            totalComponents < BRIZA_UI_COMPONENTS_EXPECTED && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--color-primary)",
                }}
              >
                <Link
                  to={ROUTES.SHOWCASE}
                  style={{
                    color: "var(--color-primary)",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                >
                  Load all components →
                </Link>
              </div>
            )}
        </div>

        {/* Avg Performance Score Card */}
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
            {totalComponents > 0 ? formatNumber(avgScore, 1) : "-"}
          </div>
          {totalComponents === 0 && (
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              No data yet
            </div>
          )}
        </div>

        {/* Web Vitals Score Card */}
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
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {state.webVitals && state.webVitals.overallScore > 0 ? (
              formatNumber(state.webVitals.overallScore, 1)
            ) : webVitalsLoading && state.dashboard.isRealTimeEnabled ? (
              <>
                <LoadingSkeleton width="80px" height="32px" />
              </>
            ) : (
              "-"
            )}
          </div>
          {webVitalsLoading &&
            state.dashboard.isRealTimeEnabled &&
            (!state.webVitals || state.webVitals.overallScore === 0) && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--color-info)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "12px",
                    height: "12px",
                    border: "2px solid var(--color-info)",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Collecting metrics...
              </div>
            )}
          {!state.dashboard.isRealTimeEnabled &&
            (!state.webVitals || state.webVitals.overallScore === 0) && (
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "var(--color-warning)",
                }}
              >
                Enable monitoring to collect
              </div>
            )}
        </div>

        {/* Monitoring Status Card */}
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
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.75rem",
              color: "var(--color-text-secondary)",
            }}
          >
            Click header button to toggle
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

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
