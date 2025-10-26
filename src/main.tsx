import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "briza-ui-react";
import { PerformanceProvider } from "./contexts";
import { ErrorBoundary } from "./components/common";
import App from "./App.tsx";
import "./styles/global.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Log environment for debugging
console.log("[App] Environment:", import.meta.env.MODE);
console.log("[App] Production:", import.meta.env.PROD);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultMode="system" enablePersistence>
            <PerformanceProvider>
              <App />
            </PerformanceProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
