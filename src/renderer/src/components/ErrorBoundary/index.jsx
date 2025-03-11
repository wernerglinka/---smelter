import React, { Component } from 'react';
import { ErrorContext } from '../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} ErrorBoundaryProps
 * @property {React.ReactNode} children - Child components to render
 * @property {string} [fallback] - Optional fallback UI message
 * @property {Function} [onError] - Optional callback when error occurs
 * @property {string} [componentName] - Name of component for error reporting
 */

/**
 * Error boundary component to catch JavaScript errors in components tree
 * @extends {Component<ErrorBoundaryProps>}
 */
class ErrorBoundary extends Component {
  static contextType = ErrorContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our error handling system
    logger.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    
    // If we have error context available, use it
    if (this.context) {
      this.context.handleError(error, this.props.componentName || 'error-boundary');
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI or custom message
      return (
        <div className="error-boundary">
          <h3>Something went wrong</h3>
          <p>{this.props.fallback || this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="error-boundary-reset"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;