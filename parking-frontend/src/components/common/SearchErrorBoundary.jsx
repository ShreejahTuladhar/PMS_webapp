import React from 'react';
import { logError, logInfo } from '../../utils/logger';

/**
 * 🛡️ Advanced Error Boundary for Search Components
 * 
 * Partner's Pentium Chronicles Evolution:
 * - Then: System crashes → Lost work → Manual recovery
 * - Now: Component errors → Graceful fallbacks → User-friendly recovery
 * 
 * This demonstrates professional error handling architecture!
 */

class SearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error with our professional logger
    logError('SearchErrorBoundary', 'Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Optional: Send to external error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Could integrate with Sentry, LogRocket, etc.
      console.error('Search component error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    
    logInfo('SearchErrorBoundary', 'User initiated retry', { 
      retryAttempt: newRetryCount 
    });

    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: newRetryCount
    });

    // Optional: Call parent retry handler
    if (this.props.onRetry) {
      this.props.onRetry(newRetryCount);
    }
  };

  handleReset = () => {
    logInfo('SearchErrorBoundary', 'User initiated reset');
    
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    });

    // Optional: Call parent reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI with recovery options
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Search Component Error
              </h3>
              <p className="text-red-700 mb-4">
                Something went wrong with the search functionality. Don't worry - this happens sometimes!
              </p>
              
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-100 rounded p-3 mb-4 text-sm">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Technical Details (Dev Mode)
                  </summary>
                  <div className="font-mono text-xs text-red-600">
                    <p><strong>Error:</strong> {this.state.error.message}</p>
                    <p><strong>Retry Count:</strong> {this.state.retryCount}</p>
                    {this.state.errorInfo && (
                      <pre className="mt-2 overflow-auto max-h-40">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={this.handleRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  disabled={this.state.retryCount >= 3}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>
                    {this.state.retryCount >= 3 ? 'Max Retries Reached' : `Retry (${this.state.retryCount}/3)`}
                  </span>
                </button>

                <button
                  onClick={this.handleReset}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset Search</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Page</span>
                </button>
              </div>

              {/* User Guidance */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800 mb-1">💡 What you can do:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Check your internet connection</li>
                  <li>• Try a different search term</li>
                  <li>• If the problem persists, contact support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Enhanced HOC wrapper for functional components
export const withSearchErrorBoundary = (Component, boundaryProps = {}) => {
  return function WrappedComponent(props) {
    return (
      <SearchErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </SearchErrorBoundary>
    );
  };
};

export default SearchErrorBoundary;