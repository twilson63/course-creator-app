/**
 * ErrorBoundary Component
 *
 * Catches React errors and displays fallback UI.
 *
 * @module src/components/ui/ErrorBoundary
 */

'use client';

import { Component, createContext, useContext, type ReactNode, type ErrorInfo } from 'react';

interface ErrorBoundaryContextValue {
  showBoundary: (error: Error) => void;
}

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

export function useErrorBoundary() {
  const context = useContext(ErrorBoundaryContext);
  if (!context) {
    return {
      showBoundary: (error: Error) => {
        throw error;
      },
    };
  }
  return context;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Something went wrong
            </h2>

            {this.state.error && (
              <p className="text-sm text-red-600 mb-4 font-mono">
                {this.state.error.message}
              </p>
            )}

            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <ErrorBoundaryContext.Provider
        value={{ showBoundary: (error) => this.setState({ hasError: true, error }) }}
      >
        {this.props.children}
      </ErrorBoundaryContext.Provider>
    );
  }
}