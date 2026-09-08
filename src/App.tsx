/**
 * Briza UI Performance Analytics Dashboard
 *
 * Main application component providing routing, layout, and core functionality
 * for monitoring and analyzing the performance of the briza-ui-react component library.
 *
 * Built with React 18+, TypeScript, and modern React patterns including:
 * - Context API for state management
 * - React Router for navigation
 * - TanStack Query for data fetching
 * - Custom performance monitoring hooks
 * - React Profiler API integration
 *
 * @author Gurleen Singh
 */

import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { usePerformanceState } from "./contexts";
import { useCoreWebVitals } from "./hooks";
import { ROUTES } from "./utils/constants";
import { Layout, Loading } from "./components";

// Lazy load page components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BrizaShowcase = lazy(() => import("./pages/BrizaShowcaseEnhanced")); // Enhanced with 24+ components
const ComponentMonitor = lazy(() => import("./pages/ComponentMonitor"));
const BundleAnalyzer = lazy(() => import("./pages/BundleAnalyzer"));
const WebVitals = lazy(() => import("./pages/WebVitals"));
const RerenderTracker = lazy(() => import("./pages/RerenderTracker"));
const ThemePerformance = lazy(() => import("./pages/ThemePerformance"));

/**
 * Starts Web Vitals monitoring and renders nothing.
 *
 * This lives apart from `App` on purpose. Reading the performance state means
 * re-rendering on every measurement, and `App` owns the route tree — so that
 * subscription used to re-render every page each time a metric landed. Holding
 * it in a leaf keeps the churn to a component with no output.
 */
function WebVitalsMonitor() {
  const { dashboard } = usePerformanceState();

  useCoreWebVitals({
    enableRealtime: dashboard.isRealTimeEnabled,
  });

  return null;
}

function App() {
  return (
    <>
      <WebVitalsMonitor />
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={ROUTES.HOME} element={<Dashboard />} />
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.SHOWCASE} element={<BrizaShowcase />} />
            <Route
              path={ROUTES.COMPONENT_MONITOR}
              element={<ComponentMonitor />}
            />
            <Route path={ROUTES.BUNDLE_ANALYZER} element={<BundleAnalyzer />} />
            <Route path={ROUTES.WEB_VITALS} element={<WebVitals />} />
            <Route
              path={ROUTES.RERENDER_TRACKER}
              element={<RerenderTracker />}
            />
            <Route
              path={ROUTES.THEME_PERFORMANCE}
              element={<ThemePerformance />}
            />
          </Routes>
        </Suspense>
      </Layout>
    </>
  );
}

export default App;
