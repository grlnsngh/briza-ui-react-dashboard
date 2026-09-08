/**
 * MonitoredComponent Tests
 *
 * Regression coverage for the live metrics path. Three defects lived here:
 * the running totals were re-derived from context state that the debounce had
 * not written yet, so a burst of renders collapsed to one; the debounce timer
 * outlived the component; and the wrapper subscribed to the very metrics it
 * produced, so it re-rendered on its own output.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useState } from "react";
import { MonitoredComponent } from "../../../src/components/MonitoredComponent";
import {
  PerformanceProvider,
  usePerformanceState,
  usePerformanceActions,
} from "../../../src/contexts";

/** Publishes a render count that the tests can read out of the DOM. */
function Readout({ name }: { name: string }) {
  const { componentMetrics } = usePerformanceState();
  return (
    <span data-testid="count">
      {componentMetrics.get(name)?.renderCount ?? "none"}
    </span>
  );
}

let bump: () => void = () => {};

function Subject({ show = true }: { show?: boolean }) {
  const [tick, setTick] = useState(0);
  bump = () => setTick((t) => t + 1);

  return show ? (
    <MonitoredComponent name="Target">
      <div>{tick}</div>
    </MonitoredComponent>
  ) : null;
}

/** Each call is its own act(), so React commits once per call. */
function renderTimes(count: number) {
  for (let index = 0; index < count; index += 1) {
    act(() => {
      bump();
    });
  }
}

describe("MonitoredComponent", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts every render in a batch, not one per batch", () => {
    const { getByTestId } = render(
      <PerformanceProvider>
        <Subject />
        <Readout name="Target" />
      </PerformanceProvider>
    );

    // Five commits inside a single debounce window, plus the mount commit.
    renderTimes(5);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    // The decisive assertion: reading the base from context instead of the ref
    // made every render in the window compute from the same value, publishing 1.
    expect(getByTestId("count").textContent).toBe("6");
  });

  it("keeps accumulating across batches", () => {
    const { getByTestId } = render(
      <PerformanceProvider>
        <Subject />
        <Readout name="Target" />
      </PerformanceProvider>
    );

    renderTimes(3);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    renderTimes(4);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // mount + 3 + 4
    expect(getByTestId("count").textContent).toBe("8");
  });

  it("leaves no timer behind on unmount", () => {
    function Host() {
      const [show, setShow] = useState(true);
      return (
        <>
          <Subject show={show} />
          <button onClick={() => setShow(false)}>hide</button>
        </>
      );
    }

    const { getByText } = render(
      <PerformanceProvider>
        <Host />
      </PerformanceProvider>
    );

    // Let the mount commit's debounce flush, so the only timer left at rest is
    // the provider's own persistence interval.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const atRest = vi.getTimerCount();

    // Arm the debounce, then tear the wrapper down before it fires.
    renderTimes(1);
    expect(vi.getTimerCount()).toBe(atRest + 1);

    act(() => {
      getByText("hide").click();
    });

    expect(vi.getTimerCount()).toBe(atRest);
  });

  it("publishes buffered renders instead of dropping them on unmount", () => {
    function Host() {
      const [show, setShow] = useState(true);
      return (
        <>
          <Subject show={show} />
          <button onClick={() => setShow(false)}>hide</button>
          <Readout name="Target" />
        </>
      );
    }

    const { getByTestId, getByText } = render(
      <PerformanceProvider>
        <Host />
      </PerformanceProvider>
    );

    renderTimes(2);

    // Unmount the monitored subtree with the debounce still pending.
    act(() => {
      getByText("hide").click();
    });

    expect(getByTestId("count").textContent).toBe("3");
  });

  it("does not re-render when other components report metrics", () => {
    let wrapperRenders = 0;

    function CountingChild() {
      wrapperRenders += 1;
      return <div>child</div>;
    }

    function Reporter() {
      const { updateComponentMetric } = usePerformanceActions();
      return (
        <button
          onClick={() =>
            updateComponentMetric({
              componentName: "Elsewhere",
              renderCount: 1,
              avgRenderTime: 1,
              lastRenderTime: 1,
              totalRenderTime: 1,
              performanceScore: 100,
              lastRenderTimestamp: Date.now(),
              renderHistory: [],
              isTracking: true,
            })
          }
        >
          report
        </button>
      );
    }

    const { getByText } = render(
      <PerformanceProvider>
        <MonitoredComponent name="Target">
          <CountingChild />
        </MonitoredComponent>
        <Reporter />
      </PerformanceProvider>
    );

    const afterMount = wrapperRenders;

    act(() => {
      getByText("report").click();
    });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // A metrics wrapper that re-renders on published metrics measures itself.
    expect(wrapperRenders).toBe(afterMount);
  });
});
