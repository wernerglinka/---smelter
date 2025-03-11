import { useFormOperations } from '../context/FormOperationsContext';
import { useError } from '../context/ErrorContext';
import { useAsyncOperation } from './useAsyncOperation';
import { handleFormSubmission } from '../lib/form-submission/submit-handler';

/**
 * Hook for handling form submissions with the standardized form operations context
 * Combines form data retrieval with submission processing
 * 
 * @param {Object} options
 * @param {string} options.formId - Form ID to target
 * @param {Object} [options.schema] - Optional schema for validation
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} - Submission state and handlers
 */
export function useFormSubmission({
  formId = 'form',
  schema = null,
  onSuccess,
  onError
}) {
  const { getFormData } = useFormOperations();
  const { setError, clearError } = useError();
  
  // Use the async operation hook for standardized loading state
  const { loading, execute, result } = useAsyncOperation({
    operation: async (filePath) => {
      clearError();
      
      if (!filePath) {
        throw new Error('File path is required for form submission');
      }
      
      // Get form data from the form operations context
      const formData = getFormData();
      
      // Use the standardized submission handler
      const result = await handleFormSubmission({
        form: formData,
        filePath,
        schema
      });
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    operationName: 'formSubmission',
    onSuccess,
    onError: (error) => {
      setError(error.message, 'validation', 'form-submission');
      if (onError) onError(error);
    }
  });
  
  /**
   * Submit the form with the given file path
   * @param {string} filePath - Path to save the file
   */
  const submitForm = async (filePath) => {
    return execute(filePath);
  };
  
  return {
    loading,
    submitForm,
    result,
    isSuccess: result && !loading
  };
}