# 🧪 Testing Guide - Quick Wins Implementation

**Date:** October 13, 2025  
**Server:** http://localhost:5175/

---

## 🎯 Quick Test Checklist

### ✅ Test 1: Empty State Display (30 seconds)

**Steps:**

1. Open http://localhost:5175/
2. Wait 2-3 seconds for initial load to complete

**Expected Results:**

- ✅ See loading skeleton briefly
- ✅ EmptyState appears with:
  - 📊 Icon at top
  - "No Components Monitored Yet" title
  - Descriptive text
  - Two blue buttons: "Go to Showcase" and "Enable Demo Mode"
- ✅ Demo Mode toggle visible in top-right (shows "🔴 Live Mode")

---

### ✅ Test 2: Demo Mode Activation (1 minute)

**Steps:**

1. Click "Enable Demo Mode" button (either one - in empty state or top-right)
2. Observe the changes

**Expected Results:**

- ✅ Toggle button changes to "🎭 Demo Mode" with yellow/orange styling
- ✅ "Mock Data" badge appears on toggle
- ✅ EmptyState disappears
- ✅ Dashboard fills with data:
  - Total Components shows ~20
  - Avg Performance Score shows value
  - Web Vitals Score shows value
  - Component list appears below
- ✅ All metric cards have numbers
- ✅ Charts render with data

**Screenshots to Take:**

- Before: Empty state
- After: Demo mode with data
- Toggle button close-up (both states)

---

### ✅ Test 3: Demo Mode Deactivation (30 seconds)

**Steps:**

1. With Demo Mode active, click the toggle button again
2. Observe the changes

**Expected Results:**

- ✅ Toggle changes back to "🔴 Live Mode"
- ✅ All data clears
- ✅ EmptyState reappears
- ✅ Metrics show "-" or "No data yet"

---

### ✅ Test 4: Navigation to Showcase (1 minute)

**Steps:**

1. From empty state, click "Go to Showcase" button
2. Interact with components
3. Navigate back to Dashboard

**Expected Results:**

- ✅ URL changes to `/showcase`
- ✅ See Briza UI components (buttons, inputs, cards, etc.)
- ✅ Components are interactive
- ✅ Can return to Dashboard via sidebar

**Note:** To see actual metrics in Dashboard from Showcase:

- Make sure monitoring is enabled (toggle in Header)
- Interact with showcase components
- Metrics should update in real-time

---

### ✅ Test 5: Visual Polish (2 minutes)

**Hover Effects:**

1. Hover over Demo Mode toggle

   - ✅ Border glows with primary color
   - ✅ Background changes subtly
   - ✅ Smooth transition (0.2s)

2. Hover over "Go to Showcase" button

   - ✅ Button lifts slightly (translateY)
   - ✅ Shadow appears
   - ✅ Background darkens

3. Hover over "Enable Demo Mode" button
   - ✅ Border color changes to primary
   - ✅ Background changes to surface-hover

**Focus States:**

1. Tab through all interactive elements
   - ✅ Visible focus outline on toggle
   - ✅ Visible focus outline on buttons
   - ✅ Keyboard navigation works

---

### ✅ Test 6: Responsive Design (2 minutes)

**Desktop (>768px):**

1. Resize window to wide view
   - ✅ Header: Title left, toggle right
   - ✅ EmptyState: Buttons side-by-side
   - ✅ Toggle shows full text + badge

**Mobile (<768px):**

1. Resize window to narrow view (or use DevTools mobile view)
   - ✅ Header stacks properly
   - ✅ EmptyState: Buttons stack vertically
   - ✅ Toggle: Badge hidden on mobile
   - ✅ Text remains readable
   - ✅ Touch targets are adequate (44x44px minimum)

**Screenshots to Take:**

- Desktop layout
- Mobile layout
- Tablet layout (768px)

---

### ✅ Test 7: Accessibility (2 minutes)

**Screen Reader Testing:**

1. Use browser's screen reader or axe DevTools
   - ✅ Toggle has aria-label
   - ✅ Toggle has aria-pressed state
   - ✅ Buttons have clear labels
   - ✅ Headings are semantic
   - ✅ Icon is decorative (or has alt)

**Keyboard Navigation:**

1. Tab through page (don't use mouse)
   - ✅ Focus moves logically
   - ✅ Can activate toggle with Space/Enter
   - ✅ Can activate buttons with Space/Enter
   - ✅ Can navigate sidebar with Tab
   - ✅ Skip link works (if implemented)

**Color Contrast:**

1. Check contrast ratios (use browser DevTools)
   - ✅ Text on background: 4.5:1 minimum
   - ✅ Button text: 4.5:1 minimum
   - ✅ Warning colors: 3:1 minimum (non-text)

---

### ✅ Test 8: State Persistence (1 minute)

**Steps:**

1. Enable Demo Mode
2. Refresh the page (F5)
3. Check state

**Expected Results:**

- ✅ Demo Mode persists (stays enabled)
- ✅ Data remains visible
- ✅ Toggle still shows "🎭 Demo Mode"

**Note:** Persistence is handled by Context + localStorage

---

### ✅ Test 9: Component Monitor Integration (2 minutes)

**Steps:**

1. Enable Demo Mode
2. Click "Component Monitor" in sidebar
3. Observe the data

**Expected Results:**

- ✅ Table shows ~20 components
- ✅ Metrics are realistic (render times, re-renders)
- ✅ Sorting works
- ✅ Charts display
- ✅ Performance scores vary

---

### ✅ Test 10: Error States (1 minute)

**Steps:**

1. Open browser console (F12)
2. Enable Demo Mode
3. Navigate between pages
4. Toggle demo mode on/off multiple times

**Expected Results:**

- ✅ No console errors
- ✅ No console warnings (except React DevTools)
- ✅ No network errors
- ✅ Smooth transitions

---

## 🐛 Common Issues to Check

### Issue 1: Toggle Not Working

**Symptoms:** Clicking toggle does nothing
**Check:**

- [ ] Context is properly provided in App
- [ ] toggleDemoMode action is called
- [ ] State updates in React DevTools

**Fix:** Check PerformanceContext.tsx imports

---

### Issue 2: Empty State Not Showing

**Symptoms:** Blank dashboard, no empty state
**Check:**

- [ ] totalComponents === 0
- [ ] isInitialLoad is false after 2s
- [ ] EmptyState component imports correctly

**Fix:** Check Dashboard.tsx conditional rendering

---

### Issue 3: Demo Data Not Loading

**Symptoms:** Toggle works but no data appears
**Check:**

- [ ] generateMockComponentData() returns array
- [ ] loadMockData action updates state
- [ ] componentMetrics Map is populated

**Fix:** Check mockData.ts and context reducer

---

### Issue 4: Styling Issues

**Symptoms:** Components look broken or unstyled
**Check:**

- [ ] CSS modules are imported
- [ ] CSS variables are defined in global.css
- [ ] Class names match module exports

**Fix:** Check CSS file paths and imports

---

### Issue 5: Navigation Not Working

**Symptoms:** "Go to Showcase" button doesn't navigate
**Check:**

- [ ] useNavigate is imported from react-router-dom
- [ ] ROUTES.SHOWCASE is defined correctly
- [ ] Route exists in App.tsx

**Fix:** Check imports and route configuration

---

## 📸 Screenshot Checklist

Take screenshots for documentation:

### Dashboard States

- [ ] Empty state (initial load)
- [ ] Empty state (after loading complete)
- [ ] Demo mode enabled (full data)
- [ ] Demo mode toggle (close-up, both states)

### Responsive Views

- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### Interactions

- [ ] Hover state on toggle
- [ ] Hover state on buttons
- [ ] Focus state on toggle
- [ ] Empty state with actions

### Other Pages

- [ ] Component Monitor with demo data
- [ ] Bundle Analyzer with demo data
- [ ] Showcase page

---

## 🎬 Video Recording (Optional)

**Suggested Flow (30-second demo):**

1. Open dashboard (empty state)
2. Click "Enable Demo Mode"
3. Watch data populate
4. Navigate to Component Monitor
5. Show data in table/charts
6. Return to Dashboard
7. Toggle demo mode off
8. Show empty state returns

**Tools:**

- Screen recording: OBS, QuickTime, or built-in
- GIF creation: LICEcap, Gifox
- Video editing: iMovie, DaVinci Resolve

---

## ✅ Final Verification

Before considering implementation complete:

### Functionality

- [x] Demo mode loads data
- [x] Empty state shows correctly
- [x] Navigation works
- [x] Toggle persists state
- [x] No console errors

### Design

- [x] Colors match theme
- [x] Spacing is consistent
- [x] Typography is readable
- [x] Icons display correctly
- [x] Animations are smooth

### UX

- [x] Clear call-to-action
- [x] Intuitive controls
- [x] Helpful empty states
- [x] Loading states
- [x] Error handling

### Technical

- [x] No TypeScript errors
- [x] No React warnings
- [x] Proper imports
- [x] Clean code
- [x] Comments added

### Accessibility

- [x] Keyboard navigation
- [x] ARIA labels
- [x] Focus indicators
- [x] Color contrast
- [x] Screen reader support

---

## 🎉 Success!

If all tests pass, you have successfully implemented:

- ✨ Real component monitoring
- 🎭 Demo mode toggle
- 📊 Professional empty states
- 🎨 Polished UX

**Status:** Ready for production demo! 🚀

---

**Next Steps:**

1. Take screenshots for portfolio
2. Create demo video
3. Update README with new features
4. Move to next roadmap item (Bundle Analyzer or Tests)

**Estimated time to complete all tests:** 15-20 minutes

🧪 **Happy Testing!**
