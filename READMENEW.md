# 🚀 Briza UI Performance Analytics Dashboard

[![React](https://img.shields.io/badge/React-18.3+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5+-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A comprehensive React Component Performance Dashboard built to monitor and analyze the performance of the briza-ui-react component library. This portfolio-grade project showcases advanced React 18+ patterns, performance optimization expertise, and modern React development practices.

**🔗 Live Demo:** [Coming Soon - Deploying to Vercel]

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Performance Optimizations](#performance-optimizations)
- [Portfolio Highlights](#portfolio-highlights)
- [Current Status](#current-status)
- [Contributing](#contributing)

---

## 🎯 Overview

The Briza UI Performance Analytics Dashboard is a production-ready React application designed to:

- **Monitor** real-time performance metrics of React components
- **Analyze** bundle sizes and tree-shaking effectiveness
- **Track** Core Web Vitals (LCP, CLS, FCP, TTFB, INP)
- **Identify** unnecessary re-renders and performance bottlenecks
- **Compare** performance against leading UI libraries
- **Visualize** performance data with interactive charts and graphs

Built as a centerpiece portfolio project for senior React developer positions, this dashboard demonstrates deep understanding of React internals, performance optimization, and modern development practices.

---

## ✨ Features

### ✅ Implemented

- **Core Infrastructure**: React 18+, TypeScript, Vite, React Router
- **State Management**: Performance Context with useReducer
- **Custom Hooks**: useComponentPerformance, useCoreWebVitals
- **Web Vitals Monitoring**: Real-time LCP, CLS, FCP, TTFB, INP tracking
- **Dashboard Overview**: Key metrics and performance summary
- **Type System**: Comprehensive TypeScript definitions
- **Global Styling**: CSS variables with dark/light theme support

### 🚧 In Progress

- Component Performance Monitor
- Bundle Size Analyzer
- Re-render Tracker
- Theme Performance Tracker
- Chart Components (Recharts integration)
- Layout Components (Sidebar, Header, Navigation)

---

## 🛠️ Technology Stack

### Core

- **React 18.3+** with Concurrent features
- **TypeScript 5.3+** for type safety
- **Vite 7+** for blazing fast builds
- **React Router v6** with code splitting

### Libraries

- **TanStack Query v5** - Data fetching
- **web-vitals** - Performance monitoring
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Zustand** - State management
- **briza-ui-react** - Component library

### Dev Tools

- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit `http://localhost:5173` (or next available port)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
npm run analyze      # Analyze bundle size
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── contexts/          # React Context providers
├── features/          # Feature modules
├── hooks/             # Custom React hooks
├── pages/             # Route pages
├── lib/               # Core libraries
├── utils/             # Utility functions
├── types/             # TypeScript definitions
├── styles/            # Global styles
└── App.tsx            # Main App component
```

---

## 🏗️ Architecture

### State Management

- **PerformanceContext**: Global performance state with useReducer
- **TanStack Query**: Server state and caching
- **Local State**: useState/useReducer for component state

### Custom Hooks

- `useComponentPerformance`: Track component metrics
- `useCoreWebVitals`: Monitor Core Web Vitals
- `useBundleAnalyzer`: Analyze bundle sizes
- `useRenderTracker`: Track re-renders

### Performance Patterns

- Code splitting with React.lazy()
- React.memo for expensive components
- useMemo/useCallback for stable references
- Suspense boundaries for loading states

---

## ⚡ Performance Optimizations

1. **Code Splitting**: Route-based lazy loading
2. **Bundle Optimization**: Tree-shaking, compression
3. **React Optimizations**: memo, useMemo, useCallback
4. **Context Optimization**: Prevent unnecessary re-renders
5. **Concurrent Features**: useTransition, useDeferredValue

**Target**: < 200KB gzipped bundle size

---

## 🎓 Portfolio Highlights

### React Expertise

✅ React 18+ with Concurrent Mode  
✅ Custom hooks patterns  
✅ Context API optimization  
✅ Profiler API integration

### TypeScript Proficiency

✅ Complex type definitions  
✅ Generic types  
✅ Type guards and narrowing

### Performance Engineering

✅ React Profiler API  
✅ Web Vitals monitoring  
✅ Bundle optimization  
✅ Memory management

### Architecture

✅ Clean code principles  
✅ Component patterns  
✅ Scalable structure

---

## 📊 Current Status

### Completed ✅

- Project setup and configuration
- Core type system
- Performance Context
- Custom hooks (useComponentPerformance, useCoreWebVitals)
- Web Vitals monitoring page
- Dashboard overview page
- Global styling system

### Next Steps 🔜

- Layout components (Sidebar, Header)
- Component Performance Monitor page
- Bundle Analyzer page
- Chart components
- Re-render Tracker
- Theme Performance Tracker
- Testing suite
- Vercel deployment

---

## 🤝 Contributing

This is a portfolio project, but feedback is welcome!

---

## 👨‍💻 Author

**Gurleen Singh**

- GitHub: [@grlnsngh](https://github.com/grlnsngh)

---

**Built with ❤️ and React**

_Last Updated: January 2025_
