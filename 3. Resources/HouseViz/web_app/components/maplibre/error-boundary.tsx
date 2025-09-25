"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class MaplibreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Maplibre Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50">
          <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
            <h3 className="text-orange-800 font-medium">Maplibre 组件加载出错</h3>
            <p className="text-orange-600 text-sm mt-1">
              {this.state.error?.message || "未知错误"}
            </p>
            <button
              className="mt-2 px-3 py-1 bg-orange-100 hover:bg-orange-200 rounded text-sm"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
