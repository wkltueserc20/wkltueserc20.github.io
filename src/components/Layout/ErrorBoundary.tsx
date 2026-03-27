import React from 'react';

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App Error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-sm text-center space-y-6">
            <div className="text-6xl">😵</div>
            <h1 className="text-xl text-slate-800 dark:text-slate-200">發生錯誤了</h1>
            <p className="text-xs text-slate-400 font-normal">
              {this.state.error?.message || '未知錯誤'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm shadow-lg active:scale-95 transition-all"
            >
              重新整理
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
