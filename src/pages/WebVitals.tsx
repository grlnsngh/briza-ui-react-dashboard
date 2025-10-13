/**
 * Web Vitals Page
 */

import { useState, useEffect } from "react";
import { usePerformanceContext } from "../contexts";
import { useCoreWebVitals } from "../hooks";
import { formatDuration } from "../utils";
import { LoadingSkeleton } from "../components/common";

export default function WebVitals() {
  const { state } = usePerformanceContext();
  const { lcp, cls, fcp, ttfb, inp, overallScore, isMonitoring } =
    useCoreWebVitals({
      enableRealtime: state.dashboard.isRealTimeEnabled,
    });

  const [isLoading, setIsLoading] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Track if user has interacted (for INP metric)
  useEffect(() => {
    const handleInteraction = () => setHasInteracted(true);
    window.addEventListener("click", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("scroll", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("scroll", handleInteraction);
    };
  }, []);

  // Stop showing loading after 8 seconds or when we have some metrics
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    if (lcp || fcp || ttfb) {
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [lcp, fcp, ttfb]);

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
          Core Web Vitals Dashboard
        </h1>
        <p
          style={{ color: "var(--color-text-secondary)", marginBottom: "1rem" }}
        >
          Real-time monitoring of Core Web Vitals metrics. Status:{" "}
          <span
            style={{
              color: isMonitoring
                ? "var(--color-success)"
                : "var(--color-error)",
            }}
          >
            {isMonitoring ? "🟢 Active" : "🔴 Inactive"}
          </span>
        </p>

        {!isMonitoring && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--color-surface)",
              border: "2px solid var(--color-warning)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              color: "var(--color-text-primary)",
            }}
          >
            ⚠️ Monitoring is disabled. Click the <strong>Monitoring</strong>{" "}
            button in the header to enable real-time tracking.
          </div>
        )}

        {isMonitoring && isLoading && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--color-surface)",
              border: "2px solid var(--color-info)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              color: "var(--color-text-primary)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid var(--color-info)",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>
              📊 Collecting Web Vitals metrics... Some metrics may take a few
              seconds to appear.
            </span>
          </div>
        )}
      </header>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* LCP */}
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
            LCP (Largest Contentful Paint)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {lcp ? (
              formatDuration(lcp.value)
            ) : isLoading && isMonitoring ? (
              <LoadingSkeleton width="80px" height="28px" />
            ) : (
              "-"
            )}
          </div>
          {lcp ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color:
                  lcp.rating === "good"
                    ? "var(--color-success)"
                    : lcp.rating === "needs-improvement"
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              ● {lcp.rating}
            </div>
          ) : isLoading && isMonitoring ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-info)",
              }}
            >
              Measuring...
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Waiting for largest content
            </div>
          )}
        </div>

        {/* CLS */}
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
            CLS (Cumulative Layout Shift)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {cls ? (
              cls.value.toFixed(3)
            ) : isLoading && isMonitoring ? (
              <LoadingSkeleton width="80px" height="28px" />
            ) : (
              "-"
            )}
          </div>
          {cls ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color:
                  cls.rating === "good"
                    ? "var(--color-success)"
                    : cls.rating === "needs-improvement"
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              ● {cls.rating}
            </div>
          ) : isLoading && isMonitoring ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-info)",
              }}
            >
              Tracking shifts...
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-text-secondary)",
              }}
            >
              No layout shifts detected
            </div>
          )}
        </div>

        {/* FCP */}
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
            FCP (First Contentful Paint)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {fcp ? (
              formatDuration(fcp.value)
            ) : isLoading && isMonitoring ? (
              <LoadingSkeleton width="80px" height="28px" />
            ) : (
              "-"
            )}
          </div>
          {fcp ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color:
                  fcp.rating === "good"
                    ? "var(--color-success)"
                    : fcp.rating === "needs-improvement"
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              ● {fcp.rating}
            </div>
          ) : isLoading && isMonitoring ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-info)",
              }}
            >
              Measuring...
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Waiting for first paint
            </div>
          )}
        </div>

        {/* INP */}
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
            INP (Interaction to Next Paint)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {inp ? (
              formatDuration(inp.value)
            ) : isLoading && isMonitoring ? (
              <LoadingSkeleton width="80px" height="28px" />
            ) : (
              "-"
            )}
          </div>
          {inp ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color:
                  inp.rating === "good"
                    ? "var(--color-success)"
                    : inp.rating === "needs-improvement"
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              ● {inp.rating}
            </div>
          ) : isLoading && isMonitoring ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-info)",
              }}
            >
              Waiting for interaction...
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {hasInteracted
                ? "No interactions recorded"
                : "Click or type to measure"}
            </div>
          )}
        </div>

        {/* TTFB */}
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
            TTFB (Time to First Byte)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
            {ttfb ? (
              formatDuration(ttfb.value)
            ) : isLoading && isMonitoring ? (
              <LoadingSkeleton width="80px" height="28px" />
            ) : (
              "-"
            )}
          </div>
          {ttfb ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color:
                  ttfb.rating === "good"
                    ? "var(--color-success)"
                    : ttfb.rating === "needs-improvement"
                    ? "var(--color-warning)"
                    : "var(--color-error)",
              }}
            >
              ● {ttfb.rating}
            </div>
          ) : isLoading && isMonitoring ? (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-info)",
              }}
            >
              Measuring...
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "0.25rem",
                color: "var(--color-text-secondary)",
              }}
            >
              Server response time
            </div>
          )}
        </div>

        {/* Overall Score */}
        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "var(--color-primary)",
            color: "white",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
              opacity: 0.9,
            }}
          >
            Overall Score
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "700" }}>
            {overallScore > 0 ? (
              overallScore.toFixed(0)
            ) : isLoading && isMonitoring ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "20px",
                    height: "20px",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : (
              "-"
            )}
          </div>
          <div
            style={{ fontSize: "0.75rem", marginTop: "0.25rem", opacity: 0.9 }}
          >
            {overallScore > 0 || !isMonitoring
              ? "out of 100"
              : "Calculating..."}
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          backgroundColor: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            marginBottom: "1rem",
            fontWeight: "600",
          }}
        >
          📚 Understanding Web Vitals
        </h2>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            fontSize: "0.875rem",
            lineHeight: "1.6",
          }}
        >
          <div>
            <strong style={{ color: "var(--color-primary)" }}>
              LCP (Largest Contentful Paint)
            </strong>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
              Measures loading performance. Should occur within{" "}
              <strong>2.5s</strong> of page load. This is when the largest
              content element becomes visible.
            </p>
          </div>

          <div>
            <strong style={{ color: "var(--color-primary)" }}>
              CLS (Cumulative Layout Shift)
            </strong>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
              Measures visual stability. Should maintain a score below{" "}
              <strong>0.1</strong>. Tracks unexpected layout shifts during page
              load. May show "-" if no shifts detected.
            </p>
          </div>

          <div>
            <strong style={{ color: "var(--color-primary)" }}>
              FCP (First Contentful Paint)
            </strong>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
              Measures perceived loading speed. Should occur within{" "}
              <strong>1.8s</strong>. This is when the first text or image
              appears.
            </p>
          </div>

          <div>
            <strong style={{ color: "var(--color-primary)" }}>
              INP (Interaction to Next Paint)
            </strong>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
              Measures interactivity. Should be below <strong>200ms</strong>.
              Requires user interaction (click, tap, keypress) to measure. Will
              show "-" until you interact with the page.
            </p>
          </div>

          <div>
            <strong style={{ color: "var(--color-primary)" }}>
              TTFB (Time to First Byte)
            </strong>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--color-text-secondary)",
              }}
            >
              Measures server response time. Should be below{" "}
              <strong>800ms</strong>. Indicates how quickly your server responds
              to requests.
            </p>
          </div>
        </div>

        {(!lcp || !fcp || !ttfb) && isMonitoring && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              color: "var(--color-text-primary)",
            }}
          >
            💡 <strong>Tip:</strong> Some metrics may take a few seconds to
            appear. Try:
            <ul
              style={{
                margin: "0.5rem 0 0",
                paddingLeft: "1.5rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <li>Scrolling the page (helps with LCP)</li>
              <li>Clicking buttons or links (required for INP)</li>
              <li>Waiting 5-10 seconds for full data collection</li>
              <li>Refreshing the page to restart measurement</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
