/**
 * PerformanceContext Tests
 *
 * Regression coverage for the persistence timer, which used to depend on the
 * metrics it was saving. Under active monitoring the effect was rebuilt faster
 * than its own 30s interval could elapse, so nothing was ever written — and for
 * the context value, which changed identity on every measurement and so
 * re-rendered every consumer, including the ones doing the measuring.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import {
  PerformanceProvider,
  usePerformanceActions,
  usePerformanceState,
  type PerformanceActions,
} from "../../../src/contexts";
import { STORAGE_KEYS } from "../../../src/utils/constants";
import type { ComponentPerformanceMetrics } from "../../../src/types/performance";

function metric(
  componentName: string,
  renderCount: number
): ComponentPerformanceMetrics {
  return {
    componentName,
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

/** Exposes the actions so a test can drive updates from outside React. */
let actions: PerformanceActions;

function ActionsHandle() {
  actions = usePerformanceActions();
  return null;
}

function readPersisted() {
  const raw = localStorage.getItem(STORAGE_KEYS.PERFORMANCE_DATA);
  return raw
    ? (JSON.parse(raw) as {
        componentMetrics: [string, ComponentPerformanceMetrics][];
      })
    : null;
}

describe("PerformanceProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("persists on schedule while metrics are actively updating", () => {
    render(
      <PerformanceProvider>
        <ActionsHandle />
      </PerformanceProvider>
    );

    expect(readPersisted()).toBeNull();

    // Report a metric every second for 31s. The old effect re-armed on each of
    // these, so the 30s interval never had an uninterrupted window to elapse.
    for (let second = 1; second <= 31; second += 1) {
      act(() => {
        actions.updateComponentMetric(metric("Widget", second));
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    const persisted = readPersisted();
    expect(persisted).not.toBeNull();

    // Not just that something was written, but that the write happened late in
    // the run and carried the accumulated count rather than the empty start.
    const [entry] = persisted!.componentMetrics;
    expect(entry[0]).toBe("Widget");
    expect(entry[1].renderCount).toBeGreaterThanOrEqual(29);
  });

  it("flushes whatever accumulated when the provider unmounts", () => {
    const { unmount } = render(
      <PerformanceProvider>
        <ActionsHandle />
      </PerformanceProvider>
    );

    act(() => {
      actions.updateComponentMetric(metric("Widget", 7));
    });

    // Well short of the 30s tick.
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(readPersisted()).toBeNull();

    unmount();

    expect(readPersisted()?.componentMetrics).toEqual([
      ["Widget", expect.objectContaining({ renderCount: 7 })],
    ]);
  });

  it("keeps the actions object stable across measurements", () => {
    const seen: PerformanceActions[] = [];

    function Probe() {
      seen.push(usePerformanceActions());
      return null;
    }

    render(
      <PerformanceProvider>
        <ActionsHandle />
        <Probe />
      </PerformanceProvider>
    );

    for (let index = 1; index <= 3; index += 1) {
      act(() => {
        actions.updateComponentMetric(metric("Widget", index));
      });
    }

    // One render. An actions consumer has no reason to re-render on metrics.
    expect(seen).toHaveLength(1);
  });

  it("re-renders state consumers when metrics change", () => {
    let stateRenders = 0;

    function StateProbe() {
      stateRenders += 1;
      const { componentMetrics } = usePerformanceState();
      return <span>{componentMetrics.size}</span>;
    }

    render(
      <PerformanceProvider>
        <ActionsHandle />
        <StateProbe />
      </PerformanceProvider>
    );

    const afterMount = stateRenders;

    act(() => {
      actions.updateComponentMetric(metric("Widget", 1));
    });

    // The split must not go so far that the dashboard stops updating.
    expect(stateRenders).toBeGreaterThan(afterMount);
  });
});
