import { useState, useCallback } from 'react';
import { useError } from '../context';

/**
 * Hook for handling async operations with standardized loading and error states
 * 
 * @param {Object} options
 * @param {Function} options.operation - Async function to execute
 * @param {string} options.operationName - Name of the operation for error context
 * @param {Function} [options.onSuccess] - Function to call on success
 * @param {Function} [options.onError] - Additional function to call on error
 * @returns {Object} - loading, execute and result states
 */
export function useAsyncOperation({
  operation,
  operationName = 'asyncOperation',
  onSuccess,
  onError
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { handleError } = useError();

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        const operationResult = await operation(...args);
        setResult(operationResult);
        
        if (onSuccess) {
          onSuccess(operationResult);
        }
        
        return operationResult;
      } catch (error) {
        handleError(error, operationName);
        
        if (onError) {
          onError(error);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [operation, operationName, onSuccess, onError, handleError]
  );

  return {
    loading,
    execute,
    result
  };
}