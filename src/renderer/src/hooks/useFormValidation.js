import { useState, useCallback } from 'react';
import { useValidation } from '../context/ValidationContext';
import { useFormOperations } from '../context/FormOperationsContext';
import { useError } from '../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * Hook for form validation management
 * 
 * Combines ValidationContext with FormOperationsContext for a complete
 * form validation solution.
 * 
 * @param {Object} options
 * @param {Object} [options.validationRules] - Map of field names to validation rules
 * @param {Function} [options.onValidationSuccess] - Called when validation passes
 * @param {Function} [options.onValidationError] - Called when validation fails
 * @returns {Object} Form validation state and methods
 */
export function useFormValidation({
  validationRules = {},
  onValidationSuccess,
  onValidationError
} = {}) {
  const { getFormData } = useFormOperations();
  const { validate, validateForm, errors, clearErrors } = useValidation();
  const { setError, clearError } = useError();
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  /**
   * Get form values from FormOperationsContext
   * @returns {Object} Form values as an object
   */
  const getFormValues = useCallback(() => {
    try {
      // Get form data from FormOperationsContext
      const formData = getFormData();
      
      // Convert FormData to a plain object
      const formValues = {};
      formData.forEach((value, key) => {
        formValues[key] = value;
      });
      
      return formValues;
    } catch (error) {
      logger.error('Failed to get form values', error);
      return {};
    }
  }, [getFormData]);
  
  /**
   * Validate a single field
   * @param {string} fieldName - Field name
   * @param {*} value - Field value
   * @returns {boolean} Whether the field is valid
   */
  const validateField = useCallback((fieldName, value) => {
    try {
      // Mark form as dirty once validation starts
      if (!isDirty) {
        setIsDirty(true);
      }
      
      // Get rules for this field
      const fieldRules = validationRules[fieldName];
      if (!fieldRules) {
        return true; // No rules = valid
      }
      
      // Use ValidationContext for validation
      const isFieldValid = validate(fieldName, value, fieldRules);
      return isFieldValid;
    } catch (error) {
      logger.error(`Field validation error: ${fieldName}`, error);
      setError(`Validation error for ${fieldName}: ${error.message}`, 'validation');
      return false;
    }
  }, [validate, validationRules, isDirty, setError]);
  
  /**
   * Validate the entire form
   * @returns {boolean} Whether the form is valid
   */
  const validateAllFields = useCallback(() => {
    try {
      // Mark as dirty
      setIsDirty(true);
      
      // Get current form values
      const formValues = getFormValues();
      
      // Validate all fields
      const formIsValid = validateForm(formValues, validationRules);
      setIsValid(formIsValid);
      
      // Call appropriate callback
      if (formIsValid) {
        clearError();
        if (onValidationSuccess) {
          onValidationSuccess(formValues);
        }
      } else {
        if (onValidationError) {
          onValidationError(errors);
        }
      }
      
      return formIsValid;
    } catch (error) {
      logger.error('Form validation error', error);
      setError('Form validation failed', 'validation');
      setIsValid(false);
      
      if (onValidationError) {
        onValidationError({ form: 'Validation process failed' });
      }
      
      return false;
    }
  }, [getFormValues, validateForm, validationRules, clearError, setError, onValidationSuccess, onValidationError, errors]);
  
  /**
   * Reset form validation state
   */
  const resetValidation = useCallback(() => {
    clearErrors();
    clearError();
    setIsValid(true);
    setIsDirty(false);
  }, [clearErrors, clearError]);
  
  return {
    validateField,
    validateAllFields,
    resetValidation,
    isValid,
    isDirty,
    errors
  };
}