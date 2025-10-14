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
import { usePerformanceContext } from "./contexts";
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

function App() {
  const { state } = usePerformanceContext();

  // Initialize Web Vitals monitoring
  useCoreWebVitals({
    enableRealtime: state.dashboard.isRealTimeEnabled,
  });

  return (
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
          <Route path={ROUTES.RERENDER_TRACKER} element={<RerenderTracker />} />
          <Route
            path={ROUTES.THEME_PERFORMANCE}
            element={<ThemePerformance />}
          />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
