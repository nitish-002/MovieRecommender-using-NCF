import React from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-primary flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center space-y-5 shadow-2xl">
            <div className="p-4 rounded-2xl bg-red-500/10 text-red-400 inline-flex border border-red-500/20">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">Something went wrong</h2>
              <p className="text-secondary text-xs mt-1 leading-relaxed">
                An unexpected interface error occurred. You can reload the page or return to home.
              </p>
              {this.state.error?.message && (
                <p className="mt-3 p-3 rounded-xl bg-surface border border-border text-[11px] font-mono text-red-400 text-left overflow-x-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-white hover:bg-accent-hover transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-border text-primary hover:bg-card transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                Return Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

