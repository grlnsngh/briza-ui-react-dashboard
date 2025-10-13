/**
 * Core Performance Types for Briza UI Performance Dashboard
 *
 * Defines all TypeScript interfaces and types for performance monitoring,
 * metrics tracking, and analytics throughout the dashboard.
 */

// =============================================================================
// PERFORMANCE METRICS
// =============================================================================

/**
 * Individual performance measurement
 */
export interface PerformanceMeasurement {
  /** Name of the measurement */
  name: string;
  /** Start time in milliseconds */
  startTime: number;
  /** Duration in milliseconds */
  duration: number;
  /** Timestamp when measurement was taken */
  timestamp: number;
}

/**
 * Component-specific performance metrics
 */
export interface ComponentPerformanceMetrics {
  /** Component name */
  componentName: string;
  /** Number of times component has rendered */
  renderCount: number;
  /** Average render time in milliseconds */
  avgRenderTime: number;
  /** Last render time in milliseconds */
  lastRenderTime: number;
  /** Total render time across all renders */
  totalRenderTime: number;
  /** Memory usage in bytes */
  memoryUsage?: number;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Timestamp of last render */
  lastRenderTimestamp: number;
  /** Array of individual render measurements */
  renderHistory: PerformanceMeasurement[];
  /** Whether component is currently being tracked */
  isTracking: boolean;
}

/**
 * Bundle size metrics
 */
export interface BundleMetrics {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Gzipped size in bytes */
  gzipSize: number;
  /** Brotli compressed size in bytes */
  brotliSize: number;
  /** Individual chunk sizes */
  chunks: ChunkMetrics[];
  /** Tree-shaking effectiveness percentage */
  treeShakingEffectiveness: number;
  /** Analysis timestamp */
  timestamp: number;
}

/**
 * Individual chunk metrics
 */
export interface ChunkMetrics {
  /** Chunk name */
  name: string;
  /** Size in bytes */
  size: number;
  /** Gzipped size */
  gzipSize: number;
  /** Chunk type (entry, dynamic, vendor) */
  type: "entry" | "dynamic" | "vendor";
  /** Modules included in chunk */
  modules: ModuleMetrics[];
}

/**
 * Module-level metrics
 */
export interface ModuleMetrics {
  /** Module path */
  path: string;
  /** Size in bytes */
  size: number;
  /** Whether module is tree-shakeable */
  treeShakeable: boolean;
  /** Dependencies */
  dependencies: string[];
}

// =============================================================================
// WEB VITALS
// =============================================================================

/**
 * Core Web Vitals metric
 */
export interface WebVitalMetric {
  /** Metric name (LCP, FID, CLS, etc.) */
  name: "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP";
  /** Metric value */
  value: number;
  /** Rating (good, needs-improvement, poor) */
  rating: "good" | "needs-improvement" | "poor";
  /** Delta from previous measurement */
  delta: number;
  /** Unique metric ID */
  id: string;
  /** Timestamp */
  timestamp: number;
  /** Navigation type */
  navigationType?: string;
}

/**
 * Aggregated Web Vitals data
 */
export interface WebVitalsData {
  /** Largest Contentful Paint */
  lcp: WebVitalMetric | null;
  /** First Input Delay */
  fid: WebVitalMetric | null;
  /** Cumulative Layout Shift */
  cls: WebVitalMetric | null;
  /** First Contentful Paint */
  fcp: WebVitalMetric | null;
  /** Time to First Byte */
  ttfb: WebVitalMetric | null;
  /** Interaction to Next Paint */
  inp: WebVitalMetric | null;
  /** Overall performance score */
  overallScore: number;
  /** Collection timestamp */
  timestamp: number;
}

// =============================================================================
// RE-RENDER TRACKING
// =============================================================================

/**
 * Re-render event information
 */
export interface RerenderEvent {
  /** Component name */
  componentName: string;
  /** Render timestamp */
  timestamp: number;
  /** Render duration */
  duration: number;
  /** Props that changed */
  changedProps: string[];
  /** State that changed */
  changedState: string[];
  /** Whether render was necessary */
  wasNecessary: boolean;
  /** Reason for render */
  reason: RenderReason;
  /** Parent component that triggered render */
  triggeredBy?: string;
}

/**
 * Reason for component re-render
 */
export type RenderReason =
  | "props-change"
  | "state-change"
  | "context-change"
  | "parent-render"
  | "force-update"
  | "hook-change";

/**
 * Render tree node for visualization
 */
export interface RenderTreeNode {
  /** Component name */
  name: string;
  /** Render count */
  renderCount: number;
  /** Total render time */
  totalTime: number;
  /** Child components */
  children: RenderTreeNode[];
  /** Unnecessary render count */
  unnecessaryRenders: number;
  /** Whether node is currently highlighted */
  isHighlighted?: boolean;
}

// =============================================================================
// THEME PERFORMANCE
// =============================================================================

/**
 * Theme performance metrics
 */
export interface ThemePerformanceMetrics {
  /** Time to switch theme (ms) */
  switchTime: number;
  /** Number of components affected */
  affectedComponentCount: number;
  /** Context update propagation time */
  propagationTime: number;
  /** CSS variable injection time */
  cssInjectionTime: number;
  /** Re-render cascade data */
  rerenderCascade: RerenderCascadeNode[];
  /** Total re-renders triggered */
  totalRerenders: number;
  /** Theme name */
  themeName: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Re-render cascade node
 */
export interface RerenderCascadeNode {
  /** Component name */
  componentName: string;
  /** Depth in cascade */
  depth: number;
  /** Time when re-render occurred */
  time: number;
  /** Duration of re-render */
  duration: number;
  /** Child re-renders */
  children: RerenderCascadeNode[];
}

// =============================================================================
// COMPARISON DATA
// =============================================================================

/**
 * Library comparison data
 */
export interface LibraryComparison {
  /** Library name */
  libraryName: string;
  /** Version */
  version: string;
  /** Bundle size */
  bundleSize: number;
  /** Average render time */
  avgRenderTime: number;
  /** Tree-shaking support */
  treeSharingSupport: boolean;
  /** TypeScript support */
  typeScriptSupport: boolean;
  /** Accessibility score */
  a11yScore: number;
  /** Performance score */
  performanceScore: number;
}

/**
 * Comparison result
 */
export interface ComparisonResult {
  /** Target library (Briza UI) */
  target: LibraryComparison;
  /** Competitors */
  competitors: LibraryComparison[];
  /** Analysis timestamp */
  timestamp: number;
  /** Winner by metric */
  winners: {
    bundleSize: string;
    renderTime: string;
    performance: string;
    a11y: string;
  };
}

// =============================================================================
// OPTIMIZATION SUGGESTIONS
// =============================================================================

/**
 * Optimization suggestion
 */
export interface OptimizationSuggestion {
  /** Unique suggestion ID */
  id: string;
  /** Suggestion title */
  title: string;
  /** Detailed description */
  description: string;
  /** Severity level */
  severity: "low" | "medium" | "high" | "critical";
  /** Category */
  category: "performance" | "bundle" | "render" | "memory" | "accessibility";
  /** Estimated impact */
  estimatedImpact: string;
  /** Code example */
  codeExample?: string;
  /** Related component */
  component?: string;
  /** Link to documentation */
  documentationLink?: string;
}

// =============================================================================
// FLAME GRAPH DATA
// =============================================================================

/**
 * Flame graph node for visualization
 */
export interface FlameGraphNode {
  /** Node name */
  name: string;
  /** Value (duration, size, etc.) */
  value: number;
  /** Child nodes */
  children: FlameGraphNode[];
  /** Node color (optional) */
  color?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// =============================================================================
// PROFILER DATA
// =============================================================================

/**
 * React Profiler data
 */
export interface ProfilerData {
  /** Profiler ID */
  id: string;
  /** Phase (mount or update) */
  phase: "mount" | "update";
  /** Actual duration of render */
  actualDuration: number;
  /** Base duration (without memoization) */
  baseDuration: number;
  /** Start time of render */
  startTime: number;
  /** Commit time */
  commitTime: number;
  /** Interactions */
  interactions: Set<unknown>;
}

// =============================================================================
// DASHBOARD STATE
// =============================================================================

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  /** Time range */
  timeRange: "1h" | "24h" | "7d" | "30d" | "all";
  /** Component filter */
  components: string[];
  /** Metric types */
  metrics: string[];
  /** Show only issues */
  showOnlyIssues: boolean;
  /** Minimum performance score */
  minPerformanceScore: number;
}

/**
 * Dashboard state
 */
export interface DashboardState {
  /** Whether dashboard is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Active filters */
  filters: DashboardFilters;
  /** Selected component for detailed view */
  selectedComponent: string | null;
  /** Whether real-time monitoring is enabled */
  isRealTimeEnabled: boolean;
  /** Last update timestamp */
  lastUpdate: number;
}

// =============================================================================
// EXPORT FORMATS
// =============================================================================

/**
 * Export format options
 */
export type ExportFormat = "json" | "csv" | "pdf" | "html";

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Format to export */
  format: ExportFormat;
  /** Data to include */
  includeMetrics: string[];
  /** Date range */
  dateRange: {
    start: Date;
    end: Date;
  };
  /** Whether to include charts */
  includeCharts: boolean;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  /** Timestamp */
  timestamp: number;
  /** Value */
  value: number;
  /** Optional label */
  label?: string;
}

/**
 * Chart data structure
 */
export interface ChartData {
  /** Labels for x-axis */
  labels: string[];
  /** Dataset */
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}
