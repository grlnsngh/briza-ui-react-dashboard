# Briza UI React Dashboard — Code Audit

**Date:** 2026-08-18
**Commit audited:** `b57d5ba` (branch `main`)
**Scope:** 57 TypeScript/TSX source files, build config, tests, CI, deployment config

---

## Executive Summary

The project is well-structured on the surface — clean folder layout, typed throughout, good JSDoc coverage. TypeScript compiles with zero errors and the production build succeeds. The problems are in **runtime correctness**, and they cluster in exactly the code that makes this a *performance* dashboard.

The headline issue: **the performance measurement layer itself is broken**. Two of the three metrics-collection paths have defects that either never fire, fire far too often, or produce numbers that are mathematically meaningless. A dashboard that reports wrong performance data is worse than no dashboard.

### Verification performed

Every claim below was verified by running the toolchain, not by reading alone:

| Command | At time of audit | After critical-fix PR |
|---|---|---|
| `npx tsc -b --force` | ✅ Exit 0, no type errors | ✅ Exit 0 |
| `npx eslint .` | ❌ **5 errors** | ✅ Exit 0 |
| `npx vite build` | ✅ Builds in ~4s | ✅ Builds in ~4s |
| `npx vitest run` | ❌ **12 of 22 tests fail** | ✅ **25 of 25 pass** |
| `npm test` | ❌ **Script does not exist** | ✅ Runs |

### Findings by severity

| Severity | Count | Theme |
|---|---|---|
| 🔴 Critical | 4 | Infinite loop, wrong numbers rendered to users, broken test suite |
| 🟠 High | 6 | Timers that never fire, re-render storms, leaked timers, a11y failures |
| 🟡 Medium | 8 | Meaningless scores, dead code, unused deps, shipped sourcemaps |
| 🔵 Low / Polish | 7 | SEO, CI, docs accuracy, robustness |

### Remediation status

All four 🔴 Critical findings are **fixed** on branch `fix/critical-bugs`. Each
section below keeps its original diagnosis for the record, with the applied fix
noted inline.

| ID | Finding | Status |
|---|---|---|
| **C1** | Infinite render loop in `useComponentPerformance` | ✅ Fixed — measurement moved to refs, publishing decoupled onto an interval; covered by 3 regression tests |
| **C2** | Percentages 100x too large on Bundle Analyzer | ✅ Fixed — `formatPercentage` contract documented, caller no longer double-multiplies |
| **C3** | 12/22 tests failing, no way to run them | ✅ Fixed — `test`/`test:watch`/`test:ui`/`test:coverage`/`typecheck` scripts added; suite green at 25/25 |
| **C4** | `npm run lint` fails with 5 errors | ✅ Fixed — Fast Refresh boundaries split out, `any` replaced with real Recharts types |

The 🟠 High, 🟡 Medium, and 🔵 Low findings below are **not** addressed by that
PR and remain open. `H3` (leaked debounce timer) is the highest-value next fix.

---

# 🔴 Critical

## C1. `useComponentPerformance` contains an unconditional infinite render loop

**File:** `src/hooks/useComponentPerformance.ts:93-162`

The effect sets a state value that is also in its own dependency array:

```ts
useEffect(() => {
  if (!isTracking) return;
  ...
  setRenderCount((prev) => prev + 1);    // line 100 — sets renderCount
  ...
  setMemoryUsage(memory.usedJSHeapSize); // line 122 — sets memoryUsage
  ...
}, [
  isTracking, componentName, trackMemory,
  memoryUsage,   // <-- line 158: set inside the effect
  renderCount,   // <-- line 159: set inside the effect
  autoReport, updateComponentMetric,
]);
```

**Failure sequence:** effect runs → `renderCount` 0→1 → re-render → dep `renderCount` changed → effect runs → 1→2 → … forever. Each iteration also calls `updateComponentMetric()`, dispatching into the global context and re-rendering every consumer. This pegs a CPU core and freezes the tab.

**Current blast radius — important nuance:** this hook is exported from `src/hooks/index.ts:5` but **no page currently calls it**. So the loop is *dormant, not actively firing*. It is a landmine: it is public API, it is documented in the README as a feature, and its own JSDoc gives a copy-paste usage example that would hang the app.

**Fix** — drive the counter from a ref and remove the self-referencing deps:

```ts
const renderCountRef = useRef(0);

useEffect(() => {
  if (!isTracking) return;

  const renderDuration = performance.now() - lastRenderStartRef.current;
  renderCountRef.current += 1;

  renderTimesRef.current.push(renderDuration);
  if (renderTimesRef.current.length > 100) renderTimesRef.current.shift();

  const avg = renderTimesRef.current.reduce((s, t) => s + t, 0)
            / renderTimesRef.current.length;

  // Publish to React state once, without feeding the effect's own deps
  setRenderCount(renderCountRef.current);
  setAvgRenderTime(avg);
  setLastRenderTime(renderDuration);

  if (autoReport) {
    updateComponentMetric(buildMetrics(avg, renderDuration));
  }
  // deps intentionally exclude renderCount/memoryUsage — they are outputs, not inputs
}, [isTracking, componentName, trackMemory, autoReport, updateComponentMetric]);
```

> **Bonus:** the hook's JSDoc claims it uses "React Profiler API". It does not — it uses two adjacent `useEffect` calls (lines 86-90 and 93-96). Both run back-to-back in the *same commit phase*, so `renderEndTime - lastRenderStartRef.current` measures the gap between two effect callbacks (approximately 0ms), **not render time**. The measurement is not merely imprecise; it measures the wrong thing entirely. `MonitoredComponent` does this correctly via `<Profiler>` — prefer it and consider deleting this hook.

### ✅ Applied fix

The shipped fix goes further than the sketch above, because publishing to state
from a per-render effect still oscillates — each publish causes a render, which
produces a sample, which triggers the next publish. Three changes together make
it terminate:

1. **Measurement writes only to refs.** A `useLayoutEffect` with no dependency
   array runs after every commit and records a sample. It never calls `setState`,
   so it cannot feed itself.
2. **Publishing is time-based, not render-based.** A separate interval (default
   1000 ms, configurable via `publishInterval`) pushes accumulated samples to
   state and to the context, and skips entirely when no new samples arrived.
3. **Self-induced renders are excluded.** A flag set immediately before the
   publish `setState` tells the layout effect to ignore the render it caused.
   Without this the hook would idle at a steady 1 render/sec forever.

The timing bug in the "Bonus" note is also fixed: `performance.now()` is now read
during the render phase and differenced inside the layout effect, so the value
spans render + commit rather than the gap between two effects.

**Regression coverage:** `tests/unit/hooks/useComponentPerformance.test.tsx`
asserts that render counts stop climbing once the pending sample is published,
that self-induced renders are not counted as samples, and that ten elapsed
intervals cause at most one re-render. Reverting the hook to its original
implementation makes the suite hang indefinitely rather than fail — which is the
clearest possible demonstration of the defect.

---

## C2. Percentages render 100x too large on the Bundle Analyzer page

**Files:** `src/utils/formatters.ts:49-51`, `src/pages/BundleAnalyzer.tsx:241-243`

`formatPercentage` multiplies by 100 (it expects a ratio, `0.25`):

```ts
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
```

The only call site in the app has **already** multiplied by 100:

```tsx
{formatPercentage(
  (dep.size / mockBundleData.totalSize) * 100   // <-- already a percentage
)}
```

**Concrete result:** `react-dom` is 388,843 of 2,458,934 bytes = 15.8%. The table renders **`1581.3%`**.

It is visibly self-contradicting: the bar next to the label uses the *same* expression as a raw CSS `width` percentage, so the bar is drawn correctly at 15.8% width while the text beside it reads 1581.3%.

**Fix** — pick one contract and enforce it. The test suite already asserts the "input is already a percentage" contract (`formatPercentage(150) === "150%"`), so align the implementation to it:

```ts
/** Formats a percentage. Input is already 0-100, e.g. 15.8 -> "15.8%" */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}
```

Then no call site changes. If you prefer the ratio contract instead, drop the `* 100` at the call site and fix the four test cases.

### ✅ Applied fix

The "already a percentage" contract was adopted, with one correction to the
sketch above: the default must be `decimals = 0`, not `1`. The suite asserts
`formatPercentage(0) === "0%"` and `formatPercentage(100) === "100%"`, which
`toFixed(1)` renders as `"0.0%"` and `"100.0%"`. Explicit-precision cases
(`formatPercentage(33.333, 1)`) are unaffected.

```ts
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals < 0 ? 0 : decimals)}%`;
}
```

The Bundle Analyzer call site therefore passes `1` explicitly to keep one decimal
place, and now renders `15.8%` where it previously read `1581.3%`.

---

## C3. 12 of 22 tests fail; there is no way to run them

**Files:** `package.json`, `tests/unit/utils/formatters.test.ts`

`package.json` has **no `test` script** despite shipping `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/*`, and a complete `vitest.config.ts`. Running `npm test` fails outright. When invoked directly via `npx vitest run`, **12 of 22 tests fail**:

| Test group | Expected | Actual | Verdict |
|---|---|---|---|
| `formatNumber` (x2) | `"1234"` | `"1,234"` | Test stale — impl uses `Intl` grouping |
| `formatBytes` (x5) | `"1.0 KB"`, `"0 B"` | `"1 KB"`, `"0 Bytes"` | Test stale — impl strips trailing zeros |
| `formatPercentage` (x4) | `"150%"` | `"15000.0%"` | **Impl wrong** — see C2 |
| `formatDate` (x1) | contains `"10"` | `"Oct 13, 2025…"` | Test stale — impl uses `month: "short"` |

So 11 failures are stale tests written against an implementation that no longer exists, and 1 group is a genuine product bug. Either way, the suite is currently decorative — it has never been run in CI (there is none) and cannot be run by convention.

**Fix** — add the scripts, then reconcile each assertion:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage",
  "typecheck": "tsc -b --noEmit"
}
```

### ✅ Applied fix

All five scripts added (`typecheck` is `tsc -b`; the `--noEmit` in the sketch is
redundant and in fact rejected under `tsc -b`, which reads it from
`tsconfig.app.json`). Reconciliation followed the verdict column:

- **`formatNumber`, `formatDate`** — tests corrected. `Intl` grouping and
  abbreviated month names are the better behaviour for a dashboard, so the
  implementation stood and the stale assertions moved. The `formatDate` test was
  additionally made timezone-independent: it previously asserted the literal day
  `"13"`, which would break in any zone at or past UTC+12.
- **`formatBytes`** — implementation corrected to `"0 B"` / `"1.0 KB"`, which
  also fixed `L2` (out-of-range input returning `"NaN undefined"`).
- **`formatPercentage`** — implementation corrected per C2.

Suite is now 25/25 green, including 3 new hook regression tests.

---

## C4. `npm run lint` fails — 5 errors on a clean checkout

**Command:** `npx eslint .`

```
src/components/MonitoredComponent.tsx
  189:17  error  Fast refresh only works when a file only exports components  react-refresh/only-export-components

src/components/charts/TreeMapChart.tsx
   40:33  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
   88:47  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
  123:25  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any

src/contexts/PerformanceContext.tsx
  457:17  error  Fast refresh only works when a file only exports components  react-refresh/only-export-components

✖ 5 problems (5 errors, 0 warnings)
```

**Fixes:**

- **`react-refresh`** — move the non-component exports into sibling files: `usePerformanceContext` → `src/contexts/usePerformanceContext.ts`; `withPerformanceMonitoring` → `src/components/withPerformanceMonitoring.tsx`. This also genuinely restores Fast Refresh, which is currently broken for the two most-edited files in the project.
- **`no-explicit-any`** — type the Recharts treemap content props properly:

```ts
interface TreeMapContentProps {
  x?: number; y?: number; width?: number; height?: number;
  index?: number; name?: string; size?: number;
  depth?: number; root?: { children?: unknown[] };
}
```

### ✅ Applied fix

`usePerformanceContext` and `withPerformanceMonitoring` moved to their own
modules. The context object and its value types moved to
`src/contexts/performanceContextValue.ts`, since re-exporting the context from
the provider file would have tripped the same rule. All 15 consumers import from
the `../contexts` barrel, so no call sites changed.

The third `any` — `data={data as any}` on `<Treemap>` — was resolved without a
cast. Recharts' `TreemapDataType` is `{ children?: …; [key: string]: unknown }`,
so mirroring that open index signature on `TreeMapNode` makes the prop assignable
directly. `eslint .` and `tsc -b` both exit 0.

---

# 🟠 High

## H1. The localStorage persistence timer never fires

**File:** `src/contexts/PerformanceContext.tsx:371-382`

```ts
useEffect(() => {
  const interval = setInterval(() => { /* save to localStorage */ }, 30000);
  return () => clearInterval(interval);
}, [state.componentMetrics, state.webVitals]);   // <-- resets the timer on every metric change
```

Every metric update changes `state.componentMetrics` (a new `Map` is constructed in the reducer), which tears down and recreates the 30-second interval. **Under active monitoring — the app's entire purpose — metrics update far more often than every 30s, so the timer resets before it ever fires and nothing is ever persisted.** The paired "load persisted data on mount" effect at line 385 therefore always finds an empty or very stale key.

Ironically the bug hides itself: persistence appears to work when you leave the app idle, and silently stops the moment it matters.

**Fix** — keep the latest state in a ref so the interval identity is stable:

```ts
const stateRef = useRef(state);
useEffect(() => { stateRef.current = state; });

useEffect(() => {
  const interval = setInterval(() => {
    setStorageItem(STORAGE_KEYS.PERFORMANCE_DATA, {
      componentMetrics: Array.from(stateRef.current.componentMetrics.entries()),
      webVitals: stateRef.current.webVitals,
      timestamp: Date.now(),
    });
  }, 30000);
  return () => clearInterval(interval);
}, []);   // <-- mount once
```

## H2. The alert check interval has the same defect — and inverts its own optimisation

**File:** `src/hooks/usePerformanceAlerts.ts:86-98`

`checkAlerts` is a `useCallback` depending on `state.componentMetrics` and `state.webVitals`, and the effect depends on `checkAlerts`. So on every metric update the effect re-runs, calls `checkAlerts()` immediately, and restarts the interval.

The net effect is the exact opposite of what the code comment intends:

```ts
checkInterval = 10000, // Check every 10 seconds (increased from 5s to reduce overhead)
```

The 10s interval effectively never elapses, while `getAllAlerts()` — which iterates every component and its full `renderHistory` — runs synchronously on **every single metric update**. Under load that is hundreds of full scans per second.

**Fix:** apply the same ref pattern as H1, so the interval mounts once and reads current state at fire time.

## H3. `MonitoredComponent` leaks its debounce timer on unmount

**File:** `src/components/MonitoredComponent.tsx:48-66`

`updateTimerRef` is set with `window.setTimeout(..., 100)` but **there is no cleanup effect**. When a monitored component unmounts inside that 100ms window, the timer still fires and dispatches into the context. Every route change through the showcase pages leaks one.

Git history shows this was fixed and then reverted — commit `d7d49a4` is `Revert "feat: Enhance performance monitoring with cleanup logic in MonitoredComponent…"`. The leak is live on `main` today.

**Fix:**

```ts
useEffect(() => {
  return () => {
    if (updateTimerRef.current) {
      window.clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    }
  };
}, []);
```

## H4. Render counts are undercounted by the debounce batching

**File:** `src/components/MonitoredComponent.tsx:115-130`

`onRenderCallback` computes the next value from context state:

```ts
const currentMetric = state.componentMetrics.get(id) || { renderCount: 0, ... };
const newRenderCount = currentMetric.renderCount + 1;
```

…but the write is debounced by 100ms. Every Profiler firing inside that window reads the *same* pre-dispatch `state`, so they all compute `currentMetric.renderCount + 1` from an identical base, and `localMetricsRef` (keyed by name) keeps only the last one.

**Result: `renderCount` increments by at most 1 per 100ms window, regardless of how many renders actually occurred.** A component that renders 40 times in a burst is recorded as having rendered once. This is the dashboard's flagship metric, and it under-reports precisely during the render storms it exists to detect.

**Fix** — accumulate in the ref rather than re-deriving from context:

```ts
const pending = localMetricsRef.current.get(id);
const base = pending ?? state.componentMetrics.get(id) ?? EMPTY_METRIC;
const newRenderCount = base.renderCount + 1;
const newTotalRenderTime = base.totalRenderTime + actualDuration;
```

Better still, move accumulation into the reducer (`ADD_RENDER_SAMPLE`) so the running total lives in one place and the component only reports raw samples.

## H5. Context value re-renders every consumer on every measurement

**File:** `src/contexts/PerformanceContext.tsx:404-439`

The `useMemo` includes the whole `state` object, so the context value changes on every action — including `SET_LOADING` and every single metric sample. Every component calling `usePerformanceContext()` re-renders, even ones that only need `toggleDemoMode`.

`getFilteredComponents` compounds it: it depends on `state.dashboard` (the whole object), so toggling `isLoading` invalidates the component filter too.

**Fix** — split into two providers so actions are referentially stable:

```tsx
<PerformanceStateContext.Provider value={state}>
  <PerformanceActionsContext.Provider value={actions}>  {/* useMemo(..., []) */}
    {children}
  </PerformanceActionsContext.Provider>
</PerformanceStateContext.Provider>
```

Components that only dispatch then never re-render on data change. For a dashboard whose thesis is "avoid unnecessary re-renders", this is also the single most valuable thing to get right.

## H6. Keyboard users cannot operate the demo-mode menu

**File:** `src/components/common/DemoModeToggle/DemoModeToggle.tsx`

Four elements use the fake-button pattern:

```tsx
<div className={styles.dropdownItem} onClick={handleLoadNormalData}
     role="button" tabIndex={0}>
```

A codebase-wide grep confirms: **4 `role="button"` elements, 0 `onKeyDown` handlers anywhere in `src/`.** These are focusable via Tab but cannot be activated by Enter or Space — a **WCAG 2.1.1 (Keyboard), Level A** failure. The dropdown additionally has no `aria-expanded`, no `aria-haspopup`, no Escape-to-close, and no click-outside-to-dismiss.

**Fix** — use real buttons. It is shorter *and* correct:

```tsx
<button type="button" className={styles.dropdownItem} onClick={handleLoadNormalData}>
  📦 Load Full Dataset
</button>
```

```tsx
<button type="button" aria-expanded={showMenu} aria-haspopup="menu"
        onClick={() => setShowMenu(v => !v)}>
```

---

# 🟡 Medium

## M1. Two incompatible performance-score formulas

Scores are computed two different ways, and the dashboard mixes them in one table:

| Source | Formula |
|---|---|
| `formatters.ts:136-161` `calculatePerformanceScore` | weighted 40% render + 40% bundle + 20% rerender |
| `MonitoredComponent.tsx:144-158` | flat deductions from 100 |

Pick one. Move it to `src/lib/performance/score.ts`, export it as the single source of truth, and unit-test it.

## M2. `calculatePerformanceScore` is called with the wrong argument

**File:** `src/hooks/useComponentPerformance.ts:128-132` (also 186-190, 219-223)

```ts
calculatePerformanceScore(avg, memoryUsage, renderCount)
//                             ^^^^^^^^^^^ parameter is `bundleSize`
```

The signature is `(renderTime, bundleSize, rerenderCount)`. Passing JS heap size (tens of megabytes) into the bundle-size slot means `100 - bundleSize/5120` goes hugely negative and clamps to 0 — **the bundle term contributes exactly 0 whenever memory tracking is on, and exactly 100 when it is off.** The score is a coin-flip on an unrelated flag.

Also, `rerenderCount` receives the *lifetime* `renderCount`, and the term is `100 - renderCount * 10` — so after 10 renders every component scores 0 on that axis forever, no matter how fast it is.

## M3. The memory penalty always fires

**File:** `src/components/MonitoredComponent.tsx:157-158`

```ts
if (memoryUsage && memoryUsage > 1000000) score -= 20;    // 1 MB
else if (memoryUsage && memoryUsage > 500000) score -= 10; // 500 KB
```

`performance.memory.usedJSHeapSize` for *any* real React page is 10-50 MB. The 1 MB branch is therefore always taken: **every component is permanently docked 20 points and no component can ever score above 80.**

Worse, `usedJSHeapSize` is a **whole-document** figure. Attributing it to an individual component is not meaningful. Either drop the memory term from per-component scoring, or measure *delta* heap across a render and report it separately as a page-level metric.

## M4. Three unused dependencies, one of them load-bearing in the README

| Package | Status |
|---|---|
| `zustand` ^5.0.8 | **Zero imports in `src/`.** README lists it as "state management" — the app uses Context + `useReducer`. |
| `framer-motion` ^12.23.24 | **Zero imports in `src/`.** Only appears as a hardcoded string in mock data. `vite.config.ts` even creates an `animation` manual chunk for it — the build emits a **0.11 kB empty stub**. |
| `@tanstack/react-query` ^5.90.2 | Provider mounted in `main.tsx`, but **no `useQuery`/`useMutation` anywhere**. Ships a 24.7 kB chunk (7.6 kB gzip) that does nothing. |

Removing all three shrinks `node_modules`, the lockfile, and the audit surface. If they are aspirational, say so in the README rather than listing them as the stack.

## M5. 3.5 MB of source maps are published to production

**File:** `vite.config.ts:41` — `sourcemap: true` unconditionally.

Measured from a real build:

```
dist total        4.3 MB
  JS + CSS        851 KB
  .map files      3.5 MB   <-- 81% of everything deployed
```

This publishes your complete original TypeScript source to anyone who opens DevTools, and it is 5x the size of the actual application.

**Fix:**

```ts
build: {
  sourcemap: mode === "development" ? true : "hidden",
}
```

`"hidden"` still generates maps for upload to an error tracker but omits the `sourceMappingURL` comment, so browsers do not fetch them.

## M6. The build violates the project's own performance budget

`constants.ts:326` declares `MAX_BUNDLE_SIZE: 200 * 1024` (200 KB). Actual output:

```
assets/index-CK5aYcqq.js     255.38 kB  | gzip:  78.74 kB
assets/charts-401QMODQ.js    348.71 kB  | gzip: 104.33 kB   <-- recharts
```

The budget is a constant nothing reads. Make it enforceable — `rollup-plugin-visualizer` is already installed; add a `size-limit` check or a small post-build assertion to CI so the number has teeth.

## M7. ~640 lines of dead page code

Only `BrizaShowcaseEnhanced` is routed (`App.tsx:26`). These three are referenced by nothing:

| File | Lines |
|---|---|
| `src/pages/BrizaShowcase.tsx` | 298 (also contains 3 stray `console.log`s) |
| `src/pages/BrizaShowcaseSimple.tsx` | 285 |
| `src/pages/BrizaShowcaseTest.tsx` | 51 |

Delete them — git history preserves them if needed.

## M8. Duplicate `DemoModeToggle` implementations

Two different components with the same name in sibling directories:

- `src/components/common/DemoModeToggle/` — 135 lines, dropdown UI, **this is the one exported and used**
- `src/components/common/DemoMode/` — 72 lines, simple toggle, **dead** (not re-exported from `common/index.ts`)

Delete `src/components/common/DemoMode/` entirely.

---

# 🔵 Low / Polish

## L1. Production-only logging on hot paths — the gate is inverted

Three sites log **only in production**:

- `MonitoredComponent.tsx:90` — every component init
- `MonitoredComponent.tsx:108` — every Profiler mount
- `PerformanceContext.tsx:285` — **every metric update**

Plus two unconditional logs in `main.tsx:23-24`. This is backwards: it is silent while you develop and noisy (and measurably slow — `console.log` is not free in a hot loop) for users. Replace with a dev-gated helper:

```ts
export const debug = import.meta.env.DEV
  ? (...args: unknown[]) => console.log(...args)
  : () => {};
```

## L2. `formatBytes` returns `"NaN undefined"` for out-of-range input

**File:** `src/utils/formatters.ts:15-25`

| Input | Output | Cause |
|---|---|---|
| `-100` | `"NaN undefined"` | `Math.log(negative)` -> `NaN` -> `sizes[NaN]` |
| `0.5` | `"512 undefined"` | `i` computes to `-1` -> `sizes[-1]` |
| `2**50` | `"1 undefined"` | `i` = 5, array has 5 entries (max index 4) |

```ts
export function formatBytes(bytes: number, decimals = 2): string {
  if (!Number.isFinite(bytes) || bytes < 1) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(Math.max(0, decimals)))} ${sizes[i]}`;
}
```

## L3. No CI — the workflows directory is empty

`.github/workflows/` exists but contains **zero files**. Given that lint and tests are both currently red, CI is what stops that recurring.

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## L4. `index.html` has no SEO or social metadata

**File:** `index.html` — title is the raw package name `briza-ui-react-dashboard`; no description, no Open Graph, no `theme-color`, and the favicon is still the stock Vite logo. For a portfolio piece meant to be shared, links currently unfurl as a blank card.

```html
<title>Briza UI — React Performance Analytics Dashboard</title>
<meta name="description" content="Real-time React performance monitoring: Core Web Vitals, render profiling, re-render tracking, and bundle analysis." />
<meta name="theme-color" content="#3b82f6" />
<meta property="og:title" content="Briza UI Performance Analytics Dashboard" />
<meta property="og:description" content="Real-time React performance monitoring and profiling." />
<meta property="og:type" content="website" />
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
```

## L5. README describes things that do not exist

| Claim | Reality |
|---|---|
| "Production-tested components with Vitest and **Playwright**" | Playwright is not a dependency; there are no e2e tests |
| Structure shows `tests/integration/` | Does not exist — the only test file is `tests/unit/utils/formatters.test.ts` |
| "Zustand — Lightweight state management" | Never imported (M4) |
| "Framer Motion — Animations and transitions" | Never imported (M4) |

Also, `docs/` holds **21 markdown files**, several of which are point-in-time status notes (`SHOWCASE_BLANK_PAGE_FIX.md`, `WEB_VITALS_QUICK_FIX.md`, `DEPLOYMENT_READY.md`, `PROJECT_COMPLETION_SUMMARY.md`). Fold the durable content into `docs/README.md` and archive the rest; a stale `READMENEW.md` also sits in the repo root.

## L6. Bundle Analyzer presents fabricated data as analysis

**File:** `src/pages/BundleAnalyzer.tsx:15-45`

The page renders a hardcoded `mockBundleData` — and that data contradicts the project it claims to analyse:

| Shown | Actual (`package.json`) |
|---|---|
| react 18.3.1 | **19.1.1** |
| react-router-dom 6.26.0 | **7.9.4** |
| recharts 2.12.7 | **3.2.1** |
| framer-motion 187 KB | **not used at all** |

For a tool whose value proposition is measurement, static fake numbers undercut the whole page. The real data already exists: `rollup-plugin-visualizer` is configured and `npm run build -- --mode analyze` emits `dist/stats.html`. Emit a JSON stats file at build time and read it, or label the page unmistakably as a UI demo.

## L7. Config nits

- **`vite.config.ts:53,58`** — `server.open: true` and `preview.open: true` spawn a browser on every start, including in CI containers. Drop them or gate on `!process.env.CI`.
- **`vite.config.ts:22`** / **`tsconfig.app.json`** — `@features` alias points at `src/features`, which does not exist.
- **`tsconfig.app.json:47`** — `"include": ["src"]` excludes `tests/`, so test files are never type-checked. Add a `tsconfig.test.json` or widen the include.
- **`eslint.config.js:17`** — `ecmaVersion: 2020` while the build targets ES2022; tests get `globals.browser` but no vitest globals despite `globals: true`.
- **`vercel.json`** — `X-XSS-Protection` is deprecated and can itself introduce vulnerabilities; modern guidance is to remove it and add `Content-Security-Policy`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.

---

# Recommended Order of Work

**Stop the bleeding (~2 hours)** — ✅ done on `fix/critical-bugs`

1. ~~**C2** — fix `formatPercentage`; the Bundle Analyzer is showing users `1581.3%` today~~
2. ~~**C1** — fix or delete `useComponentPerformance` before anyone calls it~~
3. ~~**C3** — add `test` script, reconcile the 12 failing assertions~~
4. ~~**C4** — clear the 5 lint errors~~
5. **H3** — restore the unmount cleanup that commit `d7d49a4` reverted ← **next**

**Make the metrics trustworthy (~1 day)**

6. **H1, H2** — ref pattern so both intervals actually fire
7. **H4** — accumulate render counts correctly
8. **M1, M2, M3** — one scoring function, correct arguments, drop the always-on memory penalty

**Then quality (~1 day)**

9. **H5** — split state/actions contexts
10. **H6** — real `<button>` elements
11. **M4, M5, M7, M8** — drop unused deps, hide sourcemaps, delete dead code
12. **L3** — wire up CI so none of this regresses

---

## What the project already does well

Worth keeping in view — the foundation is genuinely solid:

- **Strict TypeScript throughout**, and it compiles clean. `strict`, `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch` are all on — many projects this size have them off.
- **Route-level code splitting** via `lazy()` for all seven pages, with sensible `manualChunks`.
- **Error boundary at the root**, wrapping the entire provider tree.
- **CSS Modules per component** — no global style leakage.
- **Genuinely correct `web-vitals` integration** using the modern metric set (INP rather than the deprecated FID).
- **`MonitoredComponent`** takes the right approach — the real React `<Profiler>` API — and needs fixes rather than a rewrite.
- **Consistent, thorough JSDoc**, including usage examples.

The architecture is right. The defects are concentrated in a handful of `useEffect` dependency arrays and two arithmetic mistakes — all locally fixable without structural change.
