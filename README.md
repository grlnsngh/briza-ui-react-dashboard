# 🚀 Briza UI React - Performance Analytics Dashboard

[![React](https://img.shields.io/badge/React-19.1+-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1+-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A comprehensive performance monitoring and analytics dashboard built to track, analyze, and visualize the performance metrics of the [briza-ui-react](https://www.npmjs.com/package/briza-ui-react) component library. This production-ready application demonstrates advanced React patterns, performance optimization techniques, and modern development best practices.

**🔗 Live Demo:** [https://briza-ui-react-dashboard.vercel.app/](https://briza-ui-react-dashboard.vercel.app/)

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Dashboard Features](#dashboard-features)
- [Demo Mode](#demo-mode)
- [Performance Optimizations](#performance-optimizations)
- [Development](#development)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Author](#author)
- [License](#license)

---

## 🎯 About

The **Briza UI Performance Analytics Dashboard** is a sophisticated React application designed to provide real-time performance monitoring and analytics for the [briza-ui-react](https://www.npmjs.com/package/briza-ui-react) component library - a modern, TypeScript-based UI library with 15+ production-ready components.

### What is Briza UI React?

Briza UI React is a lightweight, tree-shakeable React component library featuring:

- 🎨 Comprehensive theme system with light/dark mode support
- ♿ WCAG 2.1 AA accessible components
- 📦 Fully tree-shakeable with zero dependencies (only React as peer)
- 🧪 Production-tested components with Vitest and Playwright
- 📖 Complete TypeScript support and Storybook documentation

### Dashboard Purpose

This dashboard serves as a comprehensive performance monitoring solution that:

- **Monitors** real-time performance metrics of React components
- **Analyzes** bundle sizes, tree-shaking effectiveness, and memory usage
- **Tracks** Core Web Vitals (LCP, CLS, FCP, TTFB, INP) according to Google's standards
- **Identifies** unnecessary re-renders and performance bottlenecks
- **Visualizes** performance data through interactive charts and graphs
- **Reports** component-level render times, memory consumption, and performance scores

Built with React 18+ concurrent features, TypeScript strict mode, and modern performance APIs, this dashboard showcases production-grade development practices suitable for enterprise applications.

---

## ✨ Features

### 📊 Performance Monitoring

- **Real-time Component Tracking**: Monitor render counts, render times, and performance scores for each component
- **Web Vitals Integration**: Track Core Web Vitals (LCP, CLS, FCP, INP, TTFB) with real-time updates
- **Memory Monitoring**: Track memory usage and identify potential memory leaks
- **Re-render Detection**: Identify unnecessary re-renders with detailed tracking
- **Performance Profiling**: Integrated React Profiler API for deep performance insights

### 📈 Data Visualization

- **Interactive Charts**: Line charts, bar charts, and treemaps using Recharts
- **Performance Trends**: Time-series visualization of component performance
- **Bundle Analysis**: TreeMap visualization of bundle composition and sizes
- **Comparative Analytics**: Compare performance across components and time periods

### 🎨 User Experience

- **Dark/Light Theme**: Complete theme system with system preference detection
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Demo Mode**: Pre-populated mock data for testing and demonstration
- **Loading States**: Polished loading indicators and skeleton screens
- **Error Boundaries**: Graceful error handling with recovery options
- **Empty States**: Helpful guidance when no data is available

### 🛠️ Developer Features

- **TypeScript**: Full type safety with 500+ lines of type definitions
- **Code Splitting**: Route-based lazy loading for optimal performance
- **Custom Hooks**: Reusable hooks for performance monitoring and Web Vitals
- **Context API**: Global state management with useReducer pattern
- **Hot Module Replacement**: Fast development with Vite HMR
- **Path Aliases**: Clean imports with TypeScript path mapping

---

## 🛠️ Technology Stack

### Core Technologies

| Technology       | Version | Purpose                                 |
| ---------------- | ------- | --------------------------------------- |
| **React**        | 19.1.1+ | UI framework with concurrent features   |
| **TypeScript**   | 5.9.3+  | Type safety and developer experience    |
| **Vite**         | 7.1.7+  | Build tool with lightning-fast HMR      |
| **React Router** | 7.9.4+  | Client-side routing with code splitting |

### State & Data Management

| Library            | Version  | Purpose                      |
| ------------------ | -------- | ---------------------------- |
| **React Context**  | Built-in | Global state management      |
| **TanStack Query** | 5.90.2+  | Server state and caching     |
| **Zustand**        | 5.0.8+   | Lightweight state management |

### Performance & Monitoring

| Library                | Version  | Purpose                         |
| ---------------------- | -------- | ------------------------------- |
| **web-vitals**         | 5.1.0+   | Core Web Vitals monitoring      |
| **React Profiler API** | Built-in | Component performance profiling |
| **Performance API**    | Native   | Browser performance metrics     |

### UI & Visualization

| Library            | Version   | Purpose                              |
| ------------------ | --------- | ------------------------------------ |
| **briza-ui-react** | 0.8.0+    | UI component library being monitored |
| **Recharts**       | 3.2.1+    | Data visualization and charts        |
| **Framer Motion**  | 12.23.24+ | Animations and transitions           |

### Development Tools

| Tool                         | Purpose                            |
| ---------------------------- | ---------------------------------- |
| **ESLint**                   | Code linting and style enforcement |
| **Vitest**                   | Unit and integration testing       |
| **rollup-plugin-visualizer** | Bundle size analysis               |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm equivalent)
- **Git**: For version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/grlnsngh/briza-ui-react-dashboard.git
   cd briza-ui-react-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Quick Start with Demo Mode

To see the dashboard in action with pre-populated data:

1. Start the development server
2. Click the **"Load Demo Data"** floating button in the bottom-right corner
3. Select **"📦 Load Full Dataset"**
4. Explore the dashboard with 23 monitored components and realistic performance metrics

---

## 📁 Project Structure

```
briza-ui-react-dashboard/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── charts/          # Chart components (Line, Bar, TreeMap)
│   │   ├── common/          # Shared components (Layout, Loading, ErrorBoundary)
│   │   └── widgets/         # Dashboard-specific widgets
│   ├── contexts/            # React Context providers
│   │   └── PerformanceContext.tsx  # Global performance state
│   ├── features/            # Feature-based modules
│   │   ├── bundle-analyzer/ # Bundle analysis feature
│   │   ├── component-monitor/ # Component monitoring feature
│   │   ├── rerender-tracker/ # Re-render tracking feature
│   │   ├── theme-performance/ # Theme performance testing
│   │   └── web-vitals/      # Web Vitals monitoring
│   ├── hooks/               # Custom React hooks
│   │   ├── useComponentPerformance.ts
│   │   ├── useCoreWebVitals.ts
│   │   └── usePerformanceAlerts.ts
│   ├── lib/                 # Core libraries and integrations
│   │   ├── monitoring/      # Performance monitoring utilities
│   │   └── performance/     # Performance calculation logic
│   ├── pages/               # Route page components
│   │   ├── Dashboard.tsx    # Main dashboard overview
│   │   ├── ComponentMonitor.tsx  # Component performance page
│   │   ├── BundleAnalyzer.tsx   # Bundle analysis page
│   │   ├── WebVitals.tsx    # Web Vitals monitoring page
│   │   ├── RerenderTracker.tsx  # Re-render tracking page
│   │   ├── ThemePerformance.tsx # Theme performance testing
│   │   └── BrizaShowcaseEnhanced.tsx # Component showcase
│   ├── types/               # TypeScript type definitions
│   │   ├── performance.ts   # Performance metrics types
│   │   ├── dashboard.ts     # Dashboard state types
│   │   └── alerts.ts        # Alert system types
│   ├── utils/               # Utility functions
│   │   ├── constants.ts     # Application constants
│   │   ├── formatters.ts    # Data formatting utilities
│   │   └── mockData.ts      # Mock data generators
│   ├── styles/              # Global styles
│   │   └── global.css       # Global CSS variables and styles
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── docs/                    # Comprehensive documentation
├── tests/                   # Test suites
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── public/                  # Static assets
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Project dependencies and scripts
```

---

## 📊 Dashboard Features

### 1. **Dashboard Overview**

The main landing page provides a high-level summary of performance metrics:

- **Total Components**: Number of components being monitored
- **Average Performance Score**: Overall performance rating (0-100)
- **Web Vitals Status**: Current Core Web Vitals health
- **Monitoring Status**: Real-time vs. demo mode indicator

**Key Metrics Cards:**

- Component count with trend indicators
- Average performance score with color-coded ratings
- Web Vitals overall score
- System status and last update timestamp

### 2. **Component Monitor**

Real-time component performance tracking with detailed metrics:

**Features:**

- 📊 Performance metrics table (render count, avg time, memory usage, score)
- 🔍 Search and filter components
- 🎯 Sortable columns (click headers to sort)
- 📈 Top 10 performance bar chart
- 📉 Render history line chart for selected components
- 🎨 Color-coded performance scores (Good/Needs Improvement/Poor)

**Performance Scoring:**

- **90-100 (Green)**: Excellent performance
- **70-89 (Yellow)**: Good performance, minor optimizations possible
- **50-69 (Orange)**: Needs improvement
- **0-49 (Red)**: Poor performance, requires attention

### 3. **Web Vitals Monitor**

Track Core Web Vitals according to Google's standards:

**Monitored Metrics:**

| Metric   | Good   | Needs Improvement | Poor    | Description                                    |
| -------- | ------ | ----------------- | ------- | ---------------------------------------------- |
| **LCP**  | ≤2.5s  | 2.5s-4s           | >4s     | Largest Contentful Paint - Loading performance |
| **CLS**  | ≤0.1   | 0.1-0.25          | >0.25   | Cumulative Layout Shift - Visual stability     |
| **FCP**  | ≤1.8s  | 1.8s-3s           | >3s     | First Contentful Paint - Initial render        |
| **INP**  | ≤200ms | 200ms-500ms       | >500ms  | Interaction to Next Paint - Responsiveness     |
| **TTFB** | ≤800ms | 800ms-1800ms      | >1800ms | Time to First Byte - Server response           |

**Features:**

- Real-time metric updates
- Color-coded status indicators
- Overall score calculation
- Historical trend visualization
- Automated monitoring toggle

### 4. **Bundle Analyzer**

Visualize and analyze your application's bundle composition:

**Features:**

- 🗂️ TreeMap visualization of bundle chunks
- 📊 Chunk size comparison charts
- 📦 Dependencies table with versions
- 💾 Bundle size breakdown with percentages
- 🎯 Gzip/Brotli compression analysis

**Insights:**

- Identify large dependencies
- Analyze tree-shaking effectiveness
- Optimize bundle splitting strategies
- Track bundle size over time

### 5. **Re-render Tracker**

Identify and diagnose unnecessary component re-renders:

**Features:**

- 🔄 Re-render count tracking per component
- ⏱️ Time spent in re-renders
- 🎯 Re-render causes (props, state, context changes)
- 📈 Re-render frequency visualization
- 💡 Optimization suggestions

### 6. **Theme Performance**

Test theme switching performance and CSS variable impact:

**Features:**

- ⚡ Theme switch timing
- 🎨 CSS variable overhead measurement
- 📊 Render time comparison (light vs. dark)
- 💾 Memory usage during theme changes

### 7. **Briza UI Showcase**

Interactive showcase of all monitored Briza UI components:

**Features:**

- 22 interactive components with live demos
- Real-time performance monitoring
- Stress testing controls for generating metrics
- Component interaction tracking
- Automatic performance registration

---

## 🎭 Demo Mode

The dashboard includes a comprehensive demo mode for testing and demonstration purposes without requiring actual application monitoring.

### Activating Demo Mode

**Option 1: Floating Button**

1. Look for the floating button in the bottom-right corner
2. Click **"Load Demo Data"**
3. Select **"📦 Load Full Dataset"**

**Option 2: Header Toggle**

1. Click the demo mode toggle in the header
2. Data loads automatically

### Demo Data Includes

**20 Normal Components:**
Realistic performance examples with varying characteristics:

- Render times: 1.8ms - 12.4ms
- Performance scores: 65-92
- Render counts: 15-67
- Memory usage tracking

**3 Problematic Components:**
Examples of performance issues to identify:

- **SlowTable**: 45.8ms render time (Score: 35)
- **LeakyModal**: 3.2MB memory usage (Score: 45)
- **OverRenderedButton**: 456 renders (Score: 60)

**Web Vitals Data:**
Complete Core Web Vitals metrics with realistic values

**Bundle Analysis:**
Simulated bundle composition with chunk sizes and dependencies

### Use Cases

- 🎯 Testing dashboard functionality
- 📊 Demonstrating features to stakeholders
- 🧪 UI/UX development and testing
- 📸 Creating screenshots and documentation
- 🎓 Learning performance monitoring concepts

---

## ⚡ Performance Optimizations

This dashboard implements numerous performance optimizations:

### React Performance Patterns

- **Code Splitting**: Route-based lazy loading with `React.lazy()`
- **Memoization**: `React.memo()` for component optimization
- **useMemo & useCallback**: Preventing unnecessary recalculations
- **Concurrent Features**: `useTransition` and `useDeferredValue` for non-blocking updates
- **Suspense Boundaries**: Granular loading states with fallbacks

### Bundle Optimization

```typescript
// vite.config.ts - Manual chunk splitting
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'charts': ['recharts'],
  'query': ['@tanstack/react-query'],
  'animation': ['framer-motion'],
}
```

**Benefits:**

- Smaller initial bundle size
- Better browser caching
- Faster subsequent page loads
- Tree-shaking of unused code

### State Management Optimization

- **Context Splitting**: Separate contexts for different concerns
- **Reducer Pattern**: Predictable state updates with useReducer
- **Selective Subscriptions**: Components only re-render when relevant data changes
- **Local Storage Caching**: Persist user preferences

### Monitoring Performance

The dashboard uses:

- **React Profiler API**: Low-overhead component timing
- **Performance API**: Native browser performance metrics
- **web-vitals Library**: Official Google Core Web Vitals implementation
- **Memory API**: Track memory usage where supported

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with HMR
npm run build        # Production build with optimizations
npm run preview      # Preview production build locally
npm run lint         # Run ESLint on codebase
```

---

## 🚀 Deployment

This project is deployed on **Vercel**. The production build is automatically deployed from the `main` branch.

**Live URL:** [https://briza-ui-react-dashboard.vercel.app/](https://briza-ui-react-dashboard.vercel.app/)

### Build Commands

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory for detailed guides on setup, features, and troubleshooting.

---

## 👨‍💻 Author

**Gurleen Singh**

- GitHub: [@grlnsngh](https://github.com/grlnsngh)
- NPM: [@grlnsngh](https://www.npmjs.com/~grlnsngh)

---

## Related Projects

- [briza-ui-react](https://github.com/grlnsngh/briza-ui-react) - The UI library being monitored
- [briza-ui-react on npm](https://www.npmjs.com/package/briza-ui-react) - NPM package
- [Storybook Documentation](https://grlnsngh.github.io/briza-ui-react/) - Component documentation

---

## � License

This project is licensed under the **MIT License**

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Vite**

⭐ Star this repository if you find it helpful!

</div>
