/**
 * Web Vitals Page
 */

import { useCoreWebVitals } from "../hooks";
import { formatDuration } from "../utils";

export default function WebVitals() {
  const { lcp, cls, fcp, ttfb, inp, overallScore, isMonitoring } =
    useCoreWebVitals({
      enableRealtime: true,
    });

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Core Web Vitals Dashboard</h1>
      <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
        Real-time monitoring of Core Web Vitals metrics. Status:{" "}
        {isMonitoring ? "🟢 Active" : "🔴 Inactive"}
      </p>

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
            {lcp ? formatDuration(lcp.value) : "-"}
          </div>
          {lcp && (
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
              {lcp.rating}
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
            {cls ? cls.value.toFixed(3) : "-"}
          </div>
          {cls && (
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
              {cls.rating}
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
            {fcp ? formatDuration(fcp.value) : "-"}
          </div>
          {fcp && (
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
              {fcp.rating}
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
            {inp ? formatDuration(inp.value) : "-"}
          </div>
          {inp && (
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
              {inp.rating}
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
            {ttfb ? formatDuration(ttfb.value) : "-"}
          </div>
          {ttfb && (
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
              {ttfb.rating}
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
            {overallScore.toFixed(0)}
          </div>
          <div
            style={{ fontSize: "0.75rem", marginTop: "0.25rem", opacity: 0.9 }}
          >
            out of 100
          </div>
        </div>
      </div>
    </div>
  );
}
