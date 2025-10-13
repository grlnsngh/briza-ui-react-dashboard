# 🐛 Showcase Page Blank Issue - Investigation & Fix

## Problem

The `/showcase` page was loading but showing a blank screen with no errors in the console.

## Root Cause Analysis

### Issue #1: MonitoredComponent Crash

The `MonitoredComponent` wrapper was likely causing a silent crash. Possible causes:

1. `usePerformanceContext()` hook failing
2. Context not available in component tree
3. Runtime error in Profiler callback

### Issue #2: No Error Boundary

React was catching the error but not displaying it, resulting in a blank page instead of an error message.

## Fixes Applied

### 1. Added Error Handling to MonitoredComponent

```tsx
// Before:
const { updateComponentMetric, state } = usePerformanceContext();

// After:
let updateComponentMetric;
let state;

try {
  const context = usePerformanceContext();
  updateComponentMetric = context.updateComponentMetric;
  state = context.state;
} catch (error) {
  console.error("MonitoredComponent: Failed to get PerformanceContext", error);
  // If context is not available, just render children without monitoring
  return <>{children}</>;
}
```

### 2. Added Null Checks

```tsx
// Before:
if (!enabled) return;

// After:
if (!enabled || !updateComponentMetric || !state) return;
```

### 3. Created Fallback Version

Created `BrizaShowcaseSimple.tsx` without MonitoredComponent wrapper to test if that was the issue.

## Testing Steps

### Step 1: Test Simple Version

```bash
# App.tsx is currently using BrizaShowcaseSimple
npm run dev
# Visit http://localhost:5174/showcase
```

**Expected Result:** Page should load with all components visible and functional.

### Step 2: Test Fixed MonitoredComponent

Once simple version works, switch back to original:

```tsx
// In App.tsx
const BrizaShowcase = lazy(() => import("./pages/BrizaShowcase"));
```

### Step 3: Verify Monitoring

1. Visit `/showcase`
2. Interact with components
3. Go to Dashboard - should see component count > 0
4. Go to Component Monitor - should see tracked components

## If Still Blank

### Check 1: Browser Console

Open DevTools (F12) and check for:

- JavaScript errors
- Failed network requests
- React errors

### Check 2: CSS Variables

The CSS uses variables like `--spacing-6`. Verify they're defined in `src/styles/global.css`:

```css
--spacing-6: 1.5rem;
--text-primary: var(--color-text-primary);
```

### Check 3: PerformanceContext

Verify PerformanceProvider is wrapping the app in `src/main.tsx`:

```tsx
<PerformanceProvider>
  <App />
</PerformanceProvider>
```

### Check 4: Lazy Loading

Check if other lazy-loaded pages work:

- `/dashboard` - Should work
- `/component-monitor` - Should work

If they work but `/showcase` doesn't, the issue is specific to BrizaShowcase component.

## Debugging Commands

### Check for Runtime Errors

```bash
npm run build
# Look for any build errors
```

### Check Dev Server Logs

```bash
npm run dev
# Watch terminal output for errors
```

### Test Components Individually

Comment out components one by one in BrizaShowcase.tsx to find which causes the crash.

## Quick Fix: Use Simple Version

If you need the showcase working immediately:

**File: `src/App.tsx`**

```tsx
const BrizaShowcase = lazy(() => import("./pages/BrizaShowcaseSimple"));
```

This version:

- ✅ Loads all 6 components
- ✅ Interactive (buttons, inputs, etc.)
- ✅ Stress testing works
- ❌ NO automatic monitoring (for now)

## Re-enable Monitoring

Once page loads, gradually add MonitoredComponent back:

### Step 1: Test One Component

```tsx
<MonitoredComponent name="Briza-Button">
  <div className={styles.componentCard}>{/* Button component */}</div>
</MonitoredComponent>
```

### Step 2: Check Dashboard

- Visit Dashboard
- Should see 1 component tracked
- If it works, add more

### Step 3: Add All Components

Once one works, wrap all 6 components.

## Prevention

### Add Error Boundary

Create `src/components/ErrorBoundary.tsx`:

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
```

Wrap Showcase route:

```tsx
<Route
  path={ROUTES.SHOWCASE}
  element={
    <ErrorBoundary>
      <BrizaShowcase />
    </ErrorBoundary>
  }
/>
```

## Status

✅ **Fixed:** Added error handling to MonitoredComponent  
✅ **Created:** Simple fallback version without monitoring  
⏳ **Testing:** Need to verify page loads correctly  
⏳ **Restore:** Need to re-enable monitoring once page works

## Next Actions

1. **Test the simple version** - Verify page loads
2. **Check browser console** - Look for any errors
3. **Test fixed MonitoredComponent** - Switch back to original
4. **Verify monitoring works** - Check Dashboard shows data
5. **Document solution** - Update README with findings

---

**Current Status:** App.tsx is using `BrizaShowcaseSimple` - **TEST THIS FIRST**

If it loads: ✅ Problem was MonitoredComponent  
If still blank: ❌ Problem is elsewhere (CSS, routing, etc.)
