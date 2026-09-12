"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ASCEND Realm Error]", {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-void p-8 text-center">
          <p className="text-sm text-[var(--color-forge-text)]">Something went wrong loading this region.</p>
          {this.state.error && (
            <p className="max-w-md text-[10px] text-[var(--color-forge-text)] opacity-50">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] rounded border border-[var(--color-forge-border-active)] px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors"
            style={{ color: "var(--color-forge-text-active)", background: "rgba(210,165,85,0.1)" }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
