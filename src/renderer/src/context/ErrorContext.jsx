import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} ErrorState
 * @property {string|null} message - Error message
 * @property {string|null} type - Error type (validation, system, etc.)
 * @property {string|null} context - Where the error occurred
 */

/**
 * @typedef {Object} ErrorContextValue
 * @property {ErrorState} error - Current error state
 * @property {Function} setError - Set error information
 * @property {Function} clearError - Clear current error
 * @property {Function} handleError - Handle and log an error
 */

const initialErrorState = {
  message: null,
  type: null,
  context: null
};

export const ErrorContext = createContext(null);

/**
 * Provider for application error handling
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ErrorProvider = ({ children }) => {
  const [error, setErrorState] = useState(initialErrorState);

  /**
   * Set an error with message, type, and context
   * @param {string} message - Error message
   * @param {string} type - Error type
   * @param {string} context - Error context
   */
  const setError = useCallback((message, type = 'general', context = 'application') => {
    logger.error(`[${type}] ${message} (${context})`);
    setErrorState({ message, type, context });
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setErrorState(initialErrorState);
  }, []);

  /**
   * Handle an Error object and log details
   * @param {Error} error - Error object to handle
   * @param {string} context - Where the error occurred
   */
  const handleError = useCallback((error, context = 'unknown') => {
    logger.error(`[${context}] ${error.message}`, error);
    setErrorState({
      message: error.message,
      type: error.name || 'UnknownError',
      context
    });
  }, []);

  const value = {
    error,
    setError,
    clearError,
    handleError
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

/**
 * Hook to access error context
 * @returns {ErrorContextValue}
 */
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}