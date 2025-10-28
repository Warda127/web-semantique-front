import React from 'react';
import './ErrorBoundary.css';

class SearchErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('SearchErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to analytics or error reporting service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Search Error: ${error.message}`,
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary search-error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3>Search Error</h3>
            <p>Something went wrong with the search functionality. Please try again.</p>
            
            <div className="error-actions">
              <button 
                className="retry-button"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="refresh-button"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>

          {/* Fallback search interface */}
          <div className="fallback-search">
            <h4>Basic Search</h4>
            <div className="basic-search-form">
              <input 
                type="text" 
                placeholder="Enter search term..."
                className="basic-search-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.target.value;
                    if (query.length >= 2) {
                      // Simple fallback search - just show message
                      alert(`Search for "${query}" - Please refresh the page to restore full functionality.`);
                    }
                  }
                }}
              />
              <p className="fallback-note">
                This is a basic search fallback. Please refresh the page to restore full search functionality.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SearchErrorBoundary;