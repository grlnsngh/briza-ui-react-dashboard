/**
 * Dashboard Types
 *
 * UI and component-specific types for the dashboard
 */

import type { ReactNode } from "react";

// =============================================================================
// LAYOUT TYPES
// =============================================================================

/**
 * Sidebar navigation item
 */
export interface NavItem {
  /** Item ID */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  path: string;
  /** Icon component */
  icon?: ReactNode;
  /** Badge count */
  badge?: number;
  /** Whether item is active */
  isActive?: boolean;
  /** Sub-items */
  children?: NavItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path */
  path?: string;
  /** Whether it's the current page */
  isCurrent?: boolean;
}

// =============================================================================
// WIDGET TYPES
// =============================================================================

/**
 * Widget configuration
 */
export interface WidgetConfig {
  /** Widget ID */
  id: string;
  /** Widget title */
  title: string;
  /** Widget type */
  type: "metric" | "chart" | "table" | "text";
  /** Size configuration */
  size: {
    width: number;
    height: number;
  };
  /** Position in grid */
  position: {
    x: number;
    y: number;
  };
  /** Whether widget is collapsible */
  collapsible?: boolean;
  /** Whether widget is initially collapsed */
  defaultCollapsed?: boolean;
  /** Refresh interval in seconds */
  refreshInterval?: number;
}

/**
 * Metric widget data
 */
export interface MetricWidget {
  /** Metric label */
  label: string;
  /** Current value */
  value: string | number;
  /** Unit of measurement */
  unit?: string;
  /** Change from previous period */
  change?: number;
  /** Trend direction */
  trend?: "up" | "down" | "neutral";
  /** Status color */
  status?: "success" | "warning" | "error" | "info";
  /** Target value */
  target?: number;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
  /** Column ID */
  id: string;
  /** Display header */
  header: string;
  /** Accessor key or function */
  accessor: keyof T | ((row: T) => unknown);
  /** Whether column is sortable */
  sortable?: boolean;
  /** Cell renderer */
  render?: (value: unknown, row: T) => ReactNode;
  /** Column width */
  width?: string | number;
  /** Alignment */
  align?: "left" | "center" | "right";
}

/**
 * Table sort state
 */
export interface TableSortState {
  /** Column ID to sort by */
  columnId: string;
  /** Sort direction */
  direction: "asc" | "desc";
}

// =============================================================================
// CHART TYPES
// =============================================================================

/**
 * Chart type
 */
export type ChartType =
  | "line"
  | "bar"
  | "area"
  | "pie"
  | "donut"
  | "scatter"
  | "radar"
  | "treemap"
  | "gauge";

/**
 * Chart configuration
 */
export interface ChartConfig {
  /** Chart type */
  type: ChartType;
  /** Chart title */
  title?: string;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Whether to show grid */
  showGrid?: boolean;
  /** Whether to animate */
  animate?: boolean;
  /** Height in pixels */
  height?: number;
  /** Color scheme */
  colors?: string[];
  /** Tooltip configuration */
  tooltip?: {
    enabled: boolean;
    format?: (value: number) => string;
  };
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification type
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Notification
 */
export interface Notification {
  /** Notification ID */
  id: string;
  /** Notification type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Message */
  message: string;
  /** Duration in milliseconds */
  duration?: number;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

// =============================================================================
// MODAL TYPES
// =============================================================================

/**
 * Modal configuration
 */
export interface ModalConfig {
  /** Modal ID */
  id: string;
  /** Modal title */
  title: string;
  /** Modal content */
  content: ReactNode;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether clicking outside closes modal */
  closeOnOutsideClick?: boolean;
  /** Whether escape key closes modal */
  closeOnEscape?: boolean;
  /** Footer actions */
  footer?: ReactNode;
}

// =============================================================================
// THEME TYPES
// =============================================================================

/**
 * Theme mode
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Color scheme
 */
export interface ColorScheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export default {};
