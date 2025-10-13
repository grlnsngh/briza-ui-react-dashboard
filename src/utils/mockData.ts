/**
 * Mock Data for Development and Demo
 *
 * Realistic performance data for Briza UI components to demonstrate
 * dashboard functionality without requiring actual component usage.
 */

import type { ComponentPerformanceMetrics } from "../types/performance";

/**
 * Generate realistic render history for a component
 */
function generateRenderHistory(
  componentName: string,
  renderCount: number
): ComponentPerformanceMetrics["renderHistory"] {
  const history: ComponentPerformanceMetrics["renderHistory"] = [];
  const now = Date.now();
  const baseRenderTime = Math.random() * 5 + 1; // 1-6ms base

  for (let i = 0; i < Math.min(renderCount, 50); i++) {
    // Vary render times slightly (±50%)
    const variation = 0.5 + Math.random();
    const duration = baseRenderTime * variation;

    history.push({
      name: `${componentName}-render-${i}`,
      startTime: now - (renderCount - i) * 1000,
      duration,
      timestamp: now - (renderCount - i) * 1000,
    });
  }

  return history;
}

/**
 * Calculate performance score based on metrics
 */
function calculateMockScore(
  avgRenderTime: number,
  memoryUsage?: number
): number {
  let score = 100;

  // Penalize slow render times
  if (avgRenderTime > 16) score -= 30; // Missed 60fps
  else if (avgRenderTime > 8) score -= 15;
  else if (avgRenderTime > 4) score -= 5;

  // Penalize high memory usage
  if (memoryUsage && memoryUsage > 1000000) score -= 20; // > 1MB
  else if (memoryUsage && memoryUsage > 500000) score -= 10; // > 500KB

  return Math.max(0, Math.min(100, score));
}

/**
 * Mock component data for common Briza UI components
 */
export function generateMockComponentData(): ComponentPerformanceMetrics[] {
  const components = [
    {
      name: "Button",
      baseRenderTime: 1.8,
      memory: 145000,
      renders: 45,
      description: "Primary button component",
    },
    {
      name: "Card",
      baseRenderTime: 3.2,
      memory: 312000,
      renders: 32,
      description: "Card container component",
    },
    {
      name: "Input",
      baseRenderTime: 2.4,
      memory: 189000,
      renders: 67,
      description: "Text input field",
    },
    {
      name: "Select",
      baseRenderTime: 4.1,
      memory: 425000,
      renders: 28,
      description: "Dropdown select component",
    },
    {
      name: "Modal",
      baseRenderTime: 6.8,
      memory: 678000,
      renders: 15,
      description: "Modal dialog component",
    },
    {
      name: "Checkbox",
      baseRenderTime: 1.5,
      memory: 98000,
      renders: 52,
      description: "Checkbox input",
    },
    {
      name: "Radio",
      baseRenderTime: 1.6,
      memory: 102000,
      renders: 38,
      description: "Radio button input",
    },
    {
      name: "Toast",
      baseRenderTime: 2.9,
      memory: 234000,
      renders: 22,
      description: "Notification toast",
    },
    {
      name: "Avatar",
      baseRenderTime: 2.1,
      memory: 156000,
      renders: 41,
      description: "User avatar component",
    },
    {
      name: "Breadcrumb",
      baseRenderTime: 2.7,
      memory: 187000,
      renders: 19,
      description: "Navigation breadcrumb",
    },
    {
      name: "Accordion",
      baseRenderTime: 5.3,
      memory: 487000,
      renders: 24,
      description: "Expandable accordion",
    },
    {
      name: "Tabs",
      baseRenderTime: 4.6,
      memory: 398000,
      renders: 31,
      description: "Tab navigation component",
    },
    {
      name: "Table",
      baseRenderTime: 12.4,
      memory: 1245000,
      renders: 18,
      description: "Data table component",
    },
    {
      name: "Pagination",
      baseRenderTime: 3.1,
      memory: 245000,
      renders: 27,
      description: "Pagination controls",
    },
    {
      name: "Progress",
      baseRenderTime: 2.3,
      memory: 134000,
      renders: 44,
      description: "Progress bar",
    },
    {
      name: "Spinner",
      baseRenderTime: 1.9,
      memory: 112000,
      renders: 56,
      description: "Loading spinner",
    },
    {
      name: "Skeleton",
      baseRenderTime: 2.8,
      memory: 203000,
      renders: 35,
      description: "Content skeleton loader",
    },
    {
      name: "Slider",
      baseRenderTime: 3.7,
      memory: 267000,
      renders: 29,
      description: "Range slider input",
    },
    {
      name: "DatePicker",
      baseRenderTime: 8.2,
      memory: 892000,
      renders: 21,
      description: "Date picker component",
    },
    {
      name: "Tooltip",
      baseRenderTime: 2.0,
      memory: 145000,
      renders: 48,
      description: "Tooltip overlay",
    },
  ];

  return components.map((comp) => {
    const variation = 0.8 + Math.random() * 0.4; // ±20% variation
    const avgRenderTime = comp.baseRenderTime * variation;
    const renderHistory = generateRenderHistory(comp.name, comp.renders);
    const totalRenderTime = renderHistory.reduce(
      (sum, r) => sum + r.duration,
      0
    );
    const performanceScore = calculateMockScore(avgRenderTime, comp.memory);

    return {
      componentName: comp.name,
      renderCount: comp.renders,
      avgRenderTime,
      lastRenderTime:
        renderHistory[renderHistory.length - 1]?.duration || avgRenderTime,
      totalRenderTime,
      memoryUsage: comp.memory,
      performanceScore,
      lastRenderTimestamp: Date.now() - Math.random() * 60000, // Last minute
      renderHistory,
      isTracking: true,
    };
  });
}

/**
 * Mock data with performance issues for testing
 */
export function generateProblematicComponents(): ComponentPerformanceMetrics[] {
  return [
    {
      componentName: "SlowTable",
      renderCount: 142,
      avgRenderTime: 45.8, // Very slow!
      lastRenderTime: 52.3,
      totalRenderTime: 6503.6,
      memoryUsage: 2456000, // High memory
      performanceScore: 35,
      lastRenderTimestamp: Date.now() - 5000,
      renderHistory: generateRenderHistory("SlowTable", 100),
      isTracking: true,
    },
    {
      componentName: "LeakyModal",
      renderCount: 89,
      avgRenderTime: 8.9,
      lastRenderTime: 9.2,
      totalRenderTime: 792.1,
      memoryUsage: 3245000, // Memory leak!
      performanceScore: 45,
      lastRenderTimestamp: Date.now() - 3000,
      renderHistory: generateRenderHistory("LeakyModal", 89),
      isTracking: true,
    },
    {
      componentName: "OverRenderedButton",
      renderCount: 456, // Too many renders!
      avgRenderTime: 3.2,
      lastRenderTime: 3.5,
      totalRenderTime: 1459.2,
      memoryUsage: 234000,
      performanceScore: 60,
      lastRenderTimestamp: Date.now() - 1000,
      renderHistory: generateRenderHistory("OverRenderedButton", 100),
      isTracking: true,
    },
  ];
}

/**
 * Get random subset of components for variety
 */
export function getRandomComponentSubset(
  count: number = 10
): ComponentPerformanceMetrics[] {
  const allComponents = generateMockComponentData();
  const shuffled = [...allComponents].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Simulate real-time updates to mock data
 */
export function updateMockComponent(
  component: ComponentPerformanceMetrics
): ComponentPerformanceMetrics {
  const newRenderTime = component.avgRenderTime * (0.9 + Math.random() * 0.2);
  const newRender = {
    name: `${component.componentName}-render-${component.renderCount}`,
    startTime: Date.now(),
    duration: newRenderTime,
    timestamp: Date.now(),
  };

  const updatedHistory = [...component.renderHistory, newRender].slice(-50);
  const totalRenderTime = updatedHistory.reduce(
    (sum, r) => sum + r.duration,
    0
  );
  const avgRenderTime = totalRenderTime / updatedHistory.length;

  return {
    ...component,
    renderCount: component.renderCount + 1,
    avgRenderTime,
    lastRenderTime: newRenderTime,
    totalRenderTime,
    lastRenderTimestamp: Date.now(),
    renderHistory: updatedHistory,
    performanceScore: calculateMockScore(avgRenderTime, component.memoryUsage),
  };
}

/**
 * Configuration for mock data
 */
export const MOCK_DATA_CONFIG = {
  /** Whether to include problematic components */
  includeProblematic: true,
  /** Number of components to generate */
  componentCount: 20,
  /** Update interval for real-time simulation (ms) */
  updateInterval: 3000,
  /** Whether to auto-update components */
  autoUpdate: true,
} as const;

/**
 * Get full mock dataset
 */
export function getFullMockDataset(): ComponentPerformanceMetrics[] {
  const normal = generateMockComponentData();
  const problematic = MOCK_DATA_CONFIG.includeProblematic
    ? generateProblematicComponents()
    : [];

  return [...normal, ...problematic];
}
