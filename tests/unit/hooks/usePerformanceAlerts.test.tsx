/**
 * usePerformanceAlerts Tests
 *
 * Regression coverage for the check interval. `checkAlerts` used to depend on
 * the metrics it reads, so the effect owning the interval was torn down and
 * rebuilt on every measurement: the timer never survived to fire, and the
 * immediate check meant to seed the panel ran on every update instead — the
 * opposite of what `checkInterval` advertises.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { usePerformanceAlerts } from "../../../src/hooks/usePerformanceAlerts";
import {
  PerformanceProvider,
  usePerformanceActions,
  usePerformanceState,
  type PerformanceActions,
} from "../../../src/contexts";
import type { ComponentPerformanceMetrics } from "../../../src/types/performance";

const getAllAlerts = vi.hoisted(() => vi.fn(() => []));

vi.mock("../../../src/lib/performance/alerts", () => ({ getAllAlerts }));

let actions: PerformanceActions;

function ActionsHandle() {
  actions = usePerformanceActions();
  return null;
}

function Consumer() {
  usePerformanceAlerts({ checkInterval: 10000 });
  return null;
}

function wrap(children: ReactNode) {
  return (
    <MemoryRouter>
      <PerformanceProvider>
        <ActionsHandle />
        {children}
      </PerformanceProvider>
    </MemoryRouter>
  );
}

function metric(renderCount: number): ComponentPerformanceMetrics {
  return {
    componentName: "Widget",
    renderCount,
    avgRenderTime: 1,
    lastRenderTime: 1,
    totalRenderTime: renderCount,
    performanceScore: 100,
    lastRenderTimestamp: Date.now(),
    renderHistory: [],
    isTracking: true,
  };
}

describe("usePerformanceAlerts", () => {
  beforeEach(() => {
    localStorage.clear();
    getAllAlerts.mockClear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("checks on the interval, not on every measurement", () => {
    render(wrap(<Consumer />));

    // One seed check when the timer is armed.
    expect(getAllAlerts).toHaveBeenCalledTimes(1);

    // 30s of continuous reporting: a metric every 100ms, 300 updates.
    for (let step = 0; step < 300; step += 1) {
      act(() => {
        actions.updateComponentMetric(metric(step));
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    // Seed plus three 10s ticks. Before the fix this was one check per update.
    expect(getAllAlerts).toHaveBeenCalledTimes(4);
  });

  it("holds the interval even when its host re-renders constantly", () => {
    // A host that does subscribe to metrics, so it re-renders on every update.
    // The interval must survive those renders: if `checkAlerts` changes
    // identity, the effect owning the timer is rebuilt before it can fire.
    function ChurningConsumer() {
      usePerformanceState();
      usePerformanceAlerts({ checkInterval: 10000 });
      return null;
    }

    render(wrap(<ChurningConsumer />));

    for (let step = 0; step < 300; step += 1) {
      act(() => {
        actions.updateComponentMetric(metric(step));
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    expect(getAllAlerts).toHaveBeenCalledTimes(4);
  });

  it("reads the latest metrics when it does check", () => {
    render(wrap(<Consumer />));

    act(() => {
      actions.updateComponentMetric(metric(42));
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    const [componentMetrics] = getAllAlerts.mock.lastCall as unknown as [
      Map<string, ComponentPerformanceMetrics>
    ];
    expect(componentMetrics.get("Widget")?.renderCount).toBe(42);
  });

  it("arms nothing while disabled", () => {
    function Disabled() {
      usePerformanceAlerts({ enabled: false, checkInterval: 10000 });
      return null;
    }

    render(wrap(<Disabled />));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(getAllAlerts).not.toHaveBeenCalled();
  });
});
