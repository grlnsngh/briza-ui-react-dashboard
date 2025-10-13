/**
 * Constants for Briza UI Performance Dashboard
 */

// =============================================================================
// PERFORMANCE THRESHOLDS
// =============================================================================

/**
 * Core Web Vitals thresholds (in milliseconds)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    GOOD: 2500,
    NEEDS_IMPROVEMENT: 4000,
  },
  FID: {
    GOOD: 100,
    NEEDS_IMPROVEMENT: 300,
  },
  CLS: {
    GOOD: 0.1,
    NEEDS_IMPROVEMENT: 0.25,
  },
  FCP: {
    GOOD: 1800,
    NEEDS_IMPROVEMENT: 3000,
  },
  TTFB: {
    GOOD: 800,
    NEEDS_IMPROVEMENT: 1800,
  },
  INP: {
    GOOD: 200,
    NEEDS_IMPROVEMENT: 500,
  },
} as const;

/**
 * Performance score thresholds
 */
export const PERFORMANCE_SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  NEEDS_IMPROVEMENT: 50,
  POOR: 0,
} as const;

/**
 * Bundle size thresholds (in bytes)
 */
export const BUNDLE_SIZE_THRESHOLDS = {
  EXCELLENT: 50 * 1024, // 50KB
  GOOD: 100 * 1024, // 100KB
  ACCEPTABLE: 200 * 1024, // 200KB
  LARGE: 500 * 1024, // 500KB
} as const;

/**
 * Render time thresholds (in milliseconds)
 */
export const RENDER_TIME_THRESHOLDS = {
  FAST: 16, // 60fps
  ACCEPTABLE: 33, // 30fps
  SLOW: 100,
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

/**
 * Color palette for charts and visualizations
 */
export const CHART_COLORS = {
  PRIMARY: "#3b82f6",
  SUCCESS: "#10b981",
  WARNING: "#f59e0b",
  ERROR: "#ef4444",
  INFO: "#06b6d4",
  PURPLE: "#8b5cf6",
  PINK: "#ec4899",
  TEAL: "#14b8a6",
  ORANGE: "#f97316",
  INDIGO: "#6366f1",
} as const;

/**
 * Chart color scales
 */
export const CHART_COLOR_SCALES = {
  PERFORMANCE: ["#10b981", "#f59e0b", "#ef4444"],
  GRADIENT_BLUE: ["#dbeafe", "#3b82f6", "#1e40af"],
  GRADIENT_GREEN: ["#d1fae5", "#10b981", "#047857"],
  HEATMAP: ["#dbeafe", "#60a5fa", "#2563eb", "#1e40af", "#1e3a8a"],
} as const;

/**
 * Time range options
 */
export const TIME_RANGES = [
  { value: "1h", label: "Last Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
] as const;

/**
 * Dashboard refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  REALTIME: 1000,
  FAST: 5000,
  NORMAL: 30000,
  SLOW: 60000,
} as const;

// =============================================================================
// COMPONENT LIBRARY COMPARISON
// =============================================================================

/**
 * Libraries to compare against
 */
export const COMPARISON_LIBRARIES = [
  {
    name: "Material-UI",
    packageName: "@mui/material",
    version: "5.x",
  },
  {
    name: "Chakra UI",
    packageName: "@chakra-ui/react",
    version: "2.x",
  },
  {
    name: "Ant Design",
    packageName: "antd",
    version: "5.x",
  },
  {
    name: "Mantine",
    packageName: "@mantine/core",
    version: "7.x",
  },
] as const;

// =============================================================================
// BRIZA UI COMPONENTS
// =============================================================================

/**
 * List of Briza UI components to track
 */
export const BRIZA_COMPONENTS = [
  "Button",
  "Input",
  "Select",
  "Checkbox",
  "Radio",
  "Modal",
  "Card",
  "Toast",
  "Avatar",
  "Breadcrumb",
  "Accordion",
  "Tabs",
  "Table",
  "Pagination",
  "Progress",
  "Spinner",
  "Skeleton",
  "Slider",
  "DatePicker",
  "FileUpload",
  "Autocomplete",
  "FormField",
] as const;

// =============================================================================
// NAVIGATION
// =============================================================================

/**
 * Dashboard routes
 */
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  SHOWCASE: "/showcase",
  COMPONENT_MONITOR: "/component-monitor",
  BUNDLE_ANALYZER: "/bundle-analyzer",
  WEB_VITALS: "/web-vitals",
  RERENDER_TRACKER: "/rerender-tracker",
  THEME_PERFORMANCE: "/theme-performance",
  COMPARISON: "/comparison",
  SETTINGS: "/settings",
} as const;

// =============================================================================
// LOCAL STORAGE KEYS
// =============================================================================

/**
 * Keys for localStorage persistence
 */
export const STORAGE_KEYS = {
  THEME: "briza-dashboard-theme",
  FILTERS: "briza-dashboard-filters",
  SELECTED_COMPONENTS: "briza-dashboard-selected-components",
  REALTIME_ENABLED: "briza-dashboard-realtime",
  PERFORMANCE_DATA: "briza-dashboard-performance-data",
} as const;

// =============================================================================
// OPTIMIZATION CATEGORIES
// =============================================================================

/**
 * Categories for optimization suggestions
 */
export const OPTIMIZATION_CATEGORIES = {
  PERFORMANCE: "performance",
  BUNDLE: "bundle",
  RENDER: "render",
  MEMORY: "memory",
  ACCESSIBILITY: "accessibility",
} as const;

/**
 * Severity levels
 */
export const SEVERITY_LEVELS = {
  CRITICAL: "critical",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

// =============================================================================
// CHART DEFAULTS
// =============================================================================

/**
 * Default chart configuration
 */
export const DEFAULT_CHART_CONFIG = {
  height: 300,
  showLegend: true,
  showGrid: true,
  animate: true,
  colors: Object.values(CHART_COLORS),
} as const;

// =============================================================================
// API ENDPOINTS (for future backend integration)
// =============================================================================

/**
 * API endpoints (placeholder for future use)
 */
export const API_ENDPOINTS = {
  METRICS: "/api/metrics",
  COMPONENTS: "/api/components",
  BUNDLE: "/api/bundle",
  WEB_VITALS: "/api/web-vitals",
  COMPARISON: "/api/comparison",
  EXPORT: "/api/export",
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

/**
 * Feature flags for enabling/disabling features
 */
export const FEATURE_FLAGS = {
  REALTIME_MONITORING: true,
  BUNDLE_ANALYSIS: true,
  COMPARISON_MODE: true,
  EXPORT_FUNCTIONALITY: true,
  ADVANCED_PROFILING: true,
  MEMORY_TRACKING: true,
} as const;

// =============================================================================
// PERFORMANCE BUDGET
// =============================================================================

/**
 * Performance budget targets
 */
export const PERFORMANCE_BUDGET = {
  MAX_BUNDLE_SIZE: 200 * 1024, // 200KB
  MAX_INITIAL_LOAD: 3000, // 3s
  MAX_TTI: 3500, // 3.5s
  MAX_LCP: 2500, // 2.5s
  MAX_FID: 100, // 100ms
  MAX_CLS: 0.1,
  MIN_LIGHTHOUSE_SCORE: 90,
} as const;
