/**
 * useCoreWebVitals Tests
 *
 * Regression coverage for the report interval. The effect that owns the timer
 * used to list every metric in its dependency array, so each incoming
 * measurement tore the interval down and armed a fresh one. While vitals were
 * still arriving faster than `reportInterval` the timer never survived long
 * enough to fire, and the performance context was told nothing during exactly
 * the window the reporting is there to cover.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useCoreWebVitals } from "../../../src/hooks/useCoreWebVitals";
import { PerformanceProvider } from "../../../src/contexts";
import type { WebVitalsData } from "../../../src/types/performance";

// web-vitals hands the page a callback per metric, once, and calls it whenever
// a new measurement lands. The mock keeps the registered listeners so `emit`
// can play measurements back on demand.
const webVitals = vi.hoisted(() => {
  interface EmittedMetric {
    name: string;
    value: number;
    delta: number;
    id: string;
    navigationType: string;
  }

  const listeners = new Map<string, ((metric: EmittedMetric) => void)[]>();

  const register =
    (name: string) => (listener: (metric: EmittedMetric) => void) => {
      listeners.set(name, [...(listeners.get(name) ?? []), listener]);
    };

  return {
    listeners,
    onLCP: register("LCP"),
    onCLS: register("CLS"),
    onFCP: register("FCP"),
    onTTFB: register("TTFB"),
    onINP: register("INP"),
  };
});

vi.mock("web-vitals", () => ({
  onLCP: webVitals.onLCP,
  onCLS: webVitals.onCLS,
  onFCP: webVitals.onFCP,
  onTTFB: webVitals.onTTFB,
  onINP: webVitals.onINP,
}));

// The hook destructures `updateWebVitals` off the actions object, so swapping
// that one member is enough to count reports; the real provider, reducer and
// state stay in place.
const updateWebVitals = vi.hoisted(() =>
  vi.fn<(vitals: WebVitalsData) => void>()
);

vi.mock("../../../src/contexts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../../src/contexts")>();

  return {
    ...actual,
    // A fresh object per render is fine: the reporting effect depends on
    // `updateWebVitals`, which keeps its identity.
    usePerformanceActions: () => ({
      ...actual.usePerformanceActions(),
      updateWebVitals,
    }),
  };
});

const REPORT_INTERVAL = 5000;

let emitCount = 0;

/** Deliver a measurement the way web-vitals would. */
function emit(name: string, value: number) {
  emitCount += 1;

  const metric = {
    name,
    value,
    delta: value,
    id: `${name}-${emitCount}`,
    navigationType: "navigate",
  };

  act(() => {
    (webVitals.listeners.get(name) ?? []).forEach((listener) =>
      listener(metric)
    );
  });
}

let handle: ReturnType<typeof useCoreWebVitals>;

function Consumer({ enableRealtime = true }: { enableRealtime?: boolean }) {
  handle = useCoreWebVitals({
    enableRealtime,
    reportInterval: REPORT_INTERVAL,
  });
  return null;
}

function wrap(children: ReactNode) {
  return <PerformanceProvider>{children}</PerformanceProvider>;
}

/** The vitals passed to the nth report. */
function report(index: number): WebVitalsData {
  return updateWebVitals.mock.calls[index][0];
}

describe("useCoreWebVitals", () => {
  beforeEach(() => {
    localStorage.clear();
    webVitals.listeners.clear();
    updateWebVitals.mockClear();
    emitCount = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports on the interval while measurements keep arriving", () => {
    render(wrap(<Consumer />));

    // 15s of continuous measurement: an LCP update every 100ms, 150 in all.
    // Before the fix every one of them rebuilt the 5s timer, so it never fired.
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
    render(wrap(<Consumer />));

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
    // LCP scores 0, CLS still scores 100.
    expect(report(1).overallScore).toBe(50);
  });

  it("arms nothing while monitoring is off", () => {
    render(wrap(<Consumer enableRealtime={false} />));

    act(() => {
      vi.advanceTimersByTime(REPORT_INTERVAL * 10);
    });

    expect(updateWebVitals).not.toHaveBeenCalled();
  });

  it("stops reporting once monitoring stops", () => {
    render(wrap(<Consumer />));

    emit("LCP", 1000);
    act(() => {
      vi.advanceTimersByTime(REPORT_INTERVAL);
    });
    expect(updateWebVitals).toHaveBeenCalledTimes(1);

    act(() => {
      handle.stopMonitoring();
    });
    act(() => {
      vi.advanceTimersByTime(REPORT_INTERVAL * 10);
    });

    expect(updateWebVitals).toHaveBeenCalledTimes(1);
  });
});
