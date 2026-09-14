/**
 * useCoreWebVitals Tests
 *
 * Regression coverage for the two halves of the hook.
 *
 * Collection: `isMonitoring` used to be seeded from `enableRealtime` with
 * `useState` and never resynchronised, so the header's Monitoring switch moved
 * the prop while the hook went on collecting (or not collecting) whatever the
 * very first render happened to see.
 *
 * Reporting: the effect that owns the report interval used to list every metric
 * in its dependency array, so each incoming measurement tore the timer down and
 * armed a fresh one. While vitals were still arriving faster than
 * `reportInterval` the timer never survived long enough to fire, and the
 * performance context was told nothing during exactly the window the reporting
 * is there to cover.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useCoreWebVitals } from "../../../src/hooks/useCoreWebVitals";
import { PerformanceProvider } from "../../../src/contexts";
import type {
  WebVitalMetric,
  WebVitalsData,
} from "../../../src/types/performance";

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

// The hook destructures `updateWebVitals` off the actions object, so swapping
// that one member is enough to count reports; the real provider, reducer and
// state stay in place. A stable module-level spy on purpose: the reporting
// effect depends on this function's identity, so wrapping it per render would
// re-arm the very timer the tests below are watching.
const updateWebVitals = vi.hoisted(() =>
  vi.fn<(vitals: WebVitalsData) => void>()
);

vi.mock("../../../src/contexts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../src/contexts")>();

  return {
    ...actual,
    usePerformanceActions: () => ({
      ...actual.usePerformanceActions(),
      updateWebVitals,
    }),
  };
});

const onMetricUpdate = vi.fn<(metric: WebVitalMetric) => void>();

const REPORT_INTERVAL = 5000;

let controls: {
  startMonitoring: () => void;
  stopMonitoring: () => void;
};

function Probe({
  enableRealtime,
  reportInterval,
}: {
  enableRealtime: boolean;
  reportInterval?: number;
}) {
  const { lcp, isMonitoring, startMonitoring, stopMonitoring } =
    useCoreWebVitals({ enableRealtime, reportInterval, onMetricUpdate });

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

  // Collection fills the metric state; this interval is what forwards it to
  // the performance context. On a timer, so these run on fake ones.
  describe("reporting to the performance context", () => {
    beforeEach(() => {
      updateWebVitals.mockClear();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    /** The vitals handed to the nth report. */
    const report = (index: number): WebVitalsData =>
      updateWebVitals.mock.calls[index][0];

    it("reports on the interval while measurements keep arriving", () => {
      render(
        wrap(<Probe enableRealtime={true} reportInterval={REPORT_INTERVAL} />)
      );

      // 15s of continuous measurement: an LCP update every 100ms, 150 in all.
      // Every one of them used to rebuild the 5s timer, so it never fired.
      for (let step = 0; step < 150; step += 1) {
        emit("LCP", 1000 + step);
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      expect(updateWebVitals).toHaveBeenCalledTimes(3);
      // And the last report is not a snapshot from when the timer was armed.
      expect(report(2).lcp?.value).toBe(1149);
    });

    it("carries the values current at each tick", () => {
      render(
        wrap(<Probe enableRealtime={true} reportInterval={REPORT_INTERVAL} />)
      );

      emit("LCP", 1000);
      emit("CLS", 0.05);
      act(() => {
        vi.advanceTimersByTime(REPORT_INTERVAL);
      });

      emit("LCP", 4200);
      emit("INP", 350);
      act(() => {
        vi.advanceTimersByTime(REPORT_INTERVAL);
      });

      expect(updateWebVitals).toHaveBeenCalledTimes(2);

      expect(report(0).lcp?.value).toBe(1000);
      expect(report(0).lcp?.rating).toBe("good");
      expect(report(0).cls?.value).toBe(0.05);
      expect(report(0).inp).toBeNull();
      expect(report(0).overallScore).toBe(100);

      expect(report(1).lcp?.value).toBe(4200);
      expect(report(1).lcp?.rating).toBe("poor");
      expect(report(1).cls?.value).toBe(0.05);
      expect(report(1).inp?.value).toBe(350);
      // LCP now scores 0, CLS still scores 100.
      expect(report(1).overallScore).toBe(50);
    });

    it("arms nothing while monitoring is off", () => {
      render(
        wrap(<Probe enableRealtime={false} reportInterval={REPORT_INTERVAL} />)
      );

      act(() => {
        vi.advanceTimersByTime(REPORT_INTERVAL * 10);
      });

      expect(updateWebVitals).not.toHaveBeenCalled();
    });

    it("stops reporting once monitoring stops", () => {
      render(
        wrap(<Probe enableRealtime={true} reportInterval={REPORT_INTERVAL} />)
      );

      emit("LCP", 1000);
      act(() => {
        vi.advanceTimersByTime(REPORT_INTERVAL);
      });
      expect(updateWebVitals).toHaveBeenCalledTimes(1);

      act(() => controls.stopMonitoring());
      act(() => {
        vi.advanceTimersByTime(REPORT_INTERVAL * 10);
      });

      expect(updateWebVitals).toHaveBeenCalledTimes(1);
    });
  });
});
