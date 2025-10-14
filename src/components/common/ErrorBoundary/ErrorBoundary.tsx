/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI instead of crashing the entire application.
 *
 * Features:
 * - Catches errors in component tree
 * - Displays user-friendly error message
 * - Shows error details in development
 * - Provides reset functionality
 * - Logs errors for debugging
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@components/common';
 *
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import { Component, type ReactNode, type ErrorInfo } from "react";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  /** Child components to protect */
  children: ReactNode;
  /** Optional fallback UI */
  fallback?: (
    error: Error,
    errorInfo: ErrorInfo,
    reset: () => void
  ) => ReactNode;
  /** Optional error handler for logging */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary implementation using class component
 * (Required because React doesn't have error boundary hooks yet)
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details
    console.error("Error Boundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);

    // Store error info in state
    this.setState({
      errorInfo,
    });

    // Call optional error handler (for error reporting services like Sentry)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo!,
          this.resetError
        );
      }

      // Default fallback UI
      return (
        <div className={styles.errorBoundary}>
          <div className={styles.errorContent}>
            <div className={styles.errorIcon}>⚠️</div>
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            <p className={styles.errorMessage}>
              We're sorry, but something unexpected happened. The error has been
              logged and we'll look into it.
            </p>

            {/* Show error details in development */}
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary className={styles.errorDetailsSummary}>
                  Error Details (Development Only)
                </summary>
                <div className={styles.errorDetailsContent}>
                  <div className={styles.errorSection}>
                    <h3>Error Message:</h3>
                    <pre>{this.state.error.message}</pre>
                  </div>
                  {this.state.error.stack && (
                    <div className={styles.errorSection}>
                      <h3>Stack Trace:</h3>
                      <pre>{this.state.error.stack}</pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div className={styles.errorSection}>
                      <h3>Component Stack:</h3>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className={styles.errorActions}>
              <button
                onClick={this.resetError}
                className={styles.primaryButton}
                aria-label="Try again"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className={styles.secondaryButton}
                aria-label="Reload page"
              >
                Reload Page
              </button>
              <a
                href="/"
                className={styles.secondaryButton}
                aria-label="Go to homepage"
              >
                Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
