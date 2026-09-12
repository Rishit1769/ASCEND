"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[ASCEND] ErrorBoundary caught:", error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-void p-8 text-center">
          <p className="text-sm text-[var(--color-forge-text)]">Something went wrong loading this region.</p>
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
