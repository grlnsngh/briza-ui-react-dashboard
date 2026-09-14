/**
 * useCoreWebVitals Tests
 *
 * Regression coverage for the monitoring toggle. `isMonitoring` used to be
 * seeded from `enableRealtime` with `useState` and never resynchronised, so the
 * header's Monitoring switch moved the prop while the hook went on collecting
 * (or not collecting) whatever the very first render happened to see.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useCoreWebVitals } from "../../../src/hooks/useCoreWebVitals";
import { PerformanceProvider } from "../../../src/contexts";
import type { WebVitalMetric } from "../../../src/types/performance";

type VitalName = "LCP" | "CLS" | "FCP" | "TTFB" | "INP";
type Reporter = (metric: unknown) => void;

// Stand in for web-vitals, keeping every callback the hook registers so the
// test can decide when a metric arrives.
const vitals = vi.hoisted(() => {
  const reporters: Record<string, Reporter[]> = {
    LCP: [],
    CLS: [],
    FCP: [],
    TTFB: [],
    INP: [],
  };
  const register = (name: string) =>
    vi.fn((report: Reporter) => {
      reporters[name].push(report);
    });

  return {
    reporters,
    onLCP: register("LCP"),
    onCLS: register("CLS"),
    onFCP: register("FCP"),
    onTTFB: register("TTFB"),
    onINP: register("INP"),
  };
});

vi.mock("web-vitals", () => ({
  onLCP: vitals.onLCP,
  onCLS: vitals.onCLS,
  onFCP: vitals.onFCP,
  onTTFB: vitals.onTTFB,
  onINP: vitals.onINP,
}));

const onMetricUpdate = vi.fn<(metric: WebVitalMetric) => void>();

let controls: {
  startMonitoring: () => void;
  stopMonitoring: () => void;
};

function Probe({ enableRealtime }: { enableRealtime: boolean }) {
  const { lcp, isMonitoring, startMonitoring, stopMonitoring } =
    useCoreWebVitals({ enableRealtime, onMetricUpdate });

  controls = { startMonitoring, stopMonitoring };

  return (
    <>
      <span data-testid="status">{isMonitoring ? "on" : "off"}</span>
      <span data-testid="lcp">{lcp ? lcp.value : "none"}</span>
    </>
  );
}

function wrap(children: ReactNode) {
  return <PerformanceProvider>{children}</PerformanceProvider>;
}

let metricId = 0;

/** Deliver a metric the way web-vitals would, to every live subscriber. */
function emit(name: VitalName, value: number) {
  metricId += 1;
  const metric = {
    name,
    value,
    delta: value,
    id: `${name}-${metricId}`,
    navigationType: "navigate",
  };

  act(() => {
    for (const report of vitals.reporters[name]) {
      report(metric);
    }
  });
}

describe("useCoreWebVitals", () => {
  beforeEach(() => {
    localStorage.clear();
    for (const name of Object.keys(vitals.reporters)) {
      vitals.reporters[name].length = 0;
    }
    vitals.onLCP.mockClear();
    vitals.onCLS.mockClear();
    vitals.onFCP.mockClear();
    vitals.onTTFB.mockClear();
    vitals.onINP.mockClear();
    onMetricUpdate.mockClear();
  });

  it("starts and stops collecting as enableRealtime changes", () => {
    const { getByTestId, rerender } = render(
      wrap(<Probe enableRealtime={false} />)
    );

    // Disabled at mount: no observers, nothing collected.
    expect(getByTestId("status").textContent).toBe("off");
    expect(vitals.onLCP).not.toHaveBeenCalled();
    emit("LCP", 1200);
    expect(onMetricUpdate).not.toHaveBeenCalled();
    expect(getByTestId("lcp").textContent).toBe("none");

    // The header turns monitoring on: collection has to start.
    rerender(wrap(<Probe enableRealtime={true} />));
    expect(getByTestId("status").textContent).toBe("on");
    expect(vitals.onLCP).toHaveBeenCalledTimes(1);
    expect(vitals.onCLS).toHaveBeenCalledTimes(1);
    expect(vitals.onFCP).toHaveBeenCalledTimes(1);
    expect(vitals.onTTFB).toHaveBeenCalledTimes(1);
    expect(vitals.onINP).toHaveBeenCalledTimes(1);

    emit("LCP", 1800);
    expect(onMetricUpdate).toHaveBeenCalledTimes(1);
    expect(getByTestId("lcp").textContent).toBe("1800");

    // ...and off again: collection has to stop.
    rerender(wrap(<Probe enableRealtime={false} />));
    expect(getByTestId("status").textContent).toBe("off");
    onMetricUpdate.mockClear();

    emit("LCP", 4000);
    expect(onMetricUpdate).not.toHaveBeenCalled();
    expect(getByTestId("lcp").textContent).toBe("1800");
  });

  it("resumes on re-enable without stacking a second set of observers", () => {
    const { getByTestId, rerender } = render(
      wrap(<Probe enableRealtime={true} />)
    );
    expect(vitals.onLCP).toHaveBeenCalledTimes(1);

    rerender(wrap(<Probe enableRealtime={false} />));
    rerender(wrap(<Probe enableRealtime={true} />));

    // web-vitals gives no unsubscribe, so a re-subscribe here would leave the
    // page carrying two observers — and report every metric twice.
    expect(vitals.onLCP).toHaveBeenCalledTimes(1);
    expect(vitals.reporters.LCP).toHaveLength(1);

    emit("LCP", 2400);
    expect(onMetricUpdate).toHaveBeenCalledTimes(1);
    expect(getByTestId("status").textContent).toBe("on");
    expect(getByTestId("lcp").textContent).toBe("2400");
  });

  it("lets startMonitoring override the prop until the prop next moves", () => {
    const { getByTestId, rerender } = render(
      wrap(<Probe enableRealtime={false} />)
    );
    expect(getByTestId("status").textContent).toBe("off");

    act(() => controls.startMonitoring());
    expect(getByTestId("status").textContent).toBe("on");
    emit("FCP", 900);
    expect(onMetricUpdate).toHaveBeenCalledTimes(1);

    // The prop moving is the caller taking control back.
    rerender(wrap(<Probe enableRealtime={true} />));
    expect(getByTestId("status").textContent).toBe("on");

    rerender(wrap(<Probe enableRealtime={false} />));
    expect(getByTestId("status").textContent).toBe("off");

    onMetricUpdate.mockClear();
    emit("FCP", 1100);
    expect(onMetricUpdate).not.toHaveBeenCalled();
  });

  it("stops collecting once the consumer unmounts", () => {
    const { unmount } = render(wrap(<Probe enableRealtime={true} />));
    expect(vitals.reporters.LCP).toHaveLength(1);

    unmount();
    onMetricUpdate.mockClear();

    // The observer outlives the component; it must not report into it.
    emit("LCP", 3200);
    expect(onMetricUpdate).not.toHaveBeenCalled();
  });
});
