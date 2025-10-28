import React from 'react';
import './ErrorBoundary.css';

class VisualizationErrorBoundary extends React.Component {
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
    console.error('VisualizationErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to analytics or error reporting service if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Visualization Error: ${error.message}`,
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
        <div className="error-boundary visualization-error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2l-8 20L9 8l-7 4 2.5-6L21.5 2z"/>
                <path d="M16 8L2 14l3.5-7L16 8z"/>
              </svg>
            </div>
            <h3>Visualization Error</h3>
            <p>Unable to render the graph or tree visualization. Showing alternative view.</p>
            
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

          {/* Fallback list view */}
          <div className="fallback-visualization">
            <h4>Entity List View</h4>
            <div className="fallback-content">
              {this.props.fallbackData ? (
                <div className="entity-list-fallback">
                  {this.props.fallbackData.entities && this.props.fallbackData.entities.length > 0 ? (
                    <ul className="entity-list">
                      {this.props.fallbackData.entities.slice(0, 10).map((entity, index) => (
                        <li key={index} className="entity-item">
                          <div className="entity-type">{entity.type || 'Unknown'}</div>
                          <div className="entity-label">{entity.label || entity.id}</div>
                          {entity.properties && (
                            <div className="entity-properties">
                              {Object.entries(entity.properties).slice(0, 3).map(([key, value]) => (
                                <span key={key} className="property">
                                  {key}: {String(value).substring(0, 50)}
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-data">No visualization data available</p>
                  )}
                  
                  {this.props.fallbackData.relationships && this.props.fallbackData.relationships.length > 0 && (
                    <div className="relationships-fallback">
                      <h5>Relationships</h5>
                      <ul className="relationship-list">
                        {this.props.fallbackData.relationships.slice(0, 5).map((rel, index) => (
                          <li key={index} className="relationship-item">
                            {rel.source} → {rel.type} → {rel.target}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="fallback-note">
                  Visualization data is not available. Please try refreshing the page or contact support if the problem persists.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VisualizationErrorBoundary;