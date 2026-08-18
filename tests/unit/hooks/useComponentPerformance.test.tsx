/**
 * useComponentPerformance Hook Tests
 *
 * Regression coverage for the self-sustaining render loop: the metrics effect
 * used to depend on `renderCount` while also setting it, so every run scheduled
 * the next one and the host component re-rendered forever.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useComponentPerformance } from "../../../src/hooks/useComponentPerformance";
import { PerformanceProvider } from "../../../src/contexts";

let renderCalls = 0;

function Probe({ publishInterval = 1000 }: { publishInterval?: number }) {
  renderCalls += 1;
  const { renderCount } = useComponentPerformance({
    componentName: "Probe",
    publishInterval,
  });
  return <div data-testid="count">{renderCount}</div>;
}

function wrap(node: ReactNode) {
  return <PerformanceProvider>{node}</PerformanceProvider>;
}

describe("useComponentPerformance", () => {
  beforeEach(() => {
    renderCalls = 0;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("settles instead of re-rendering forever", () => {
    render(wrap(<Probe />));

    // Let many publish intervals elapse.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    const afterFirstWindow = renderCalls;

    // The decisive assertion: once the pending sample is published the hook
    // stops generating work. A looping hook would keep climbing here.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(renderCalls).toBe(afterFirstWindow);
  });

  it("keeps self-induced renders out of the sample count", () => {
    const { getByTestId } = render(wrap(<Probe />));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // One real mount render was measured. The re-render caused by publishing
    // that measurement must not be counted as a second render.
    expect(getByTestId("count").textContent).toBe("1");
  });

  it("publishes at most one re-render per interval", () => {
    render(wrap(<Probe publishInterval={100} />));
    const mountRenders = renderCalls;

    act(() => {
      vi.advanceTimersByTime(1000); // 10 intervals
    });

    // Ten intervals must not mean ten re-renders; only the single pending
    // sample is published.
    expect(renderCalls - mountRenders).toBeLessThanOrEqual(1);
  });
});
