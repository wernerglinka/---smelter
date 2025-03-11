import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@utils/services/logger';
import * as validators from '@utils/validation/form';

/**
 * @typedef {Object.<string, string>} ValidationErrors
 */

/**
 * @typedef {Object} ValidationContextValue
 * @property {ValidationErrors} errors - Field validation errors by field name
 * @property {Function} validate - Validate a field against a rule
 * @property {Function} validateForm - Validate all form fields
 * @property {Function} clearErrors - Clear all validation errors
 * @property {Function} clearFieldError - Clear a specific field error
 * @property {Function} setFieldError - Set an error for a specific field
 * @property {Function} getValidators - Get available validators
 */

// Create context
export const ValidationContext = createContext(null);

/**
 * ValidationProvider component
 * 
 * Provides centralized validation utilities and error tracking
 * for form fields across the application.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element}
 */
export const ValidationProvider = ({ children }) => {
  const [errors, setErrors] = useState({});

  /**
   * Get all available validators
   * @returns {Object} Map of validator functions
   */
  const getValidators = useCallback(() => {
    return validators;
  }, []);

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Clear a specific field error
   * @param {string} fieldName - Field name to clear error for
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  /**
   * Set an error for a specific field
   * @param {string} fieldName - Field name
   * @param {string} errorMessage - Error message
   */
  const setFieldError = useCallback((fieldName, errorMessage) => {
    // Safeguard against undefined fieldNames
    if (!fieldName) {
      logger.warn('Attempted to set validation error for undefined field name');
      return;
    }
    
    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage
    }));
  }, []);

  /**
   * Validate a field against validation rules
   * @param {string} fieldName - Name of the field to validate
   * @param {*} value - Field value to validate
   * @param {Object} validationRules - Rules to apply (e.g., { required: true, minLength: 5 })
   * @returns {boolean} True if valid, false if invalid
   */
  const validate = useCallback((fieldName, value, validationRules) => {
    try {
      // Clear any existing error for this field
      clearFieldError(fieldName);

      // No rules means valid
      if (!validationRules) {
        return true;
      }

      // Iterate through validation rules
      for (const [rule, ruleValue] of Object.entries(validationRules)) {
        // Skip rules that are set to false
        if (ruleValue === false) continue;

        let isValid = true;
        let errorMessage = '';

        // Apply appropriate validator
        switch (rule) {
          case 'required':
            if (ruleValue === true && !validators.required(value)) {
              isValid = false;
              errorMessage = 'This field is required';
            }
            break;

          case 'minLength':
            if (!validators.minLength(ruleValue)(value)) {
              isValid = false;
              errorMessage = `Must be at least ${ruleValue} characters`;
            }
            break;

          case 'maxLength':
            if (!validators.maxLength(ruleValue)(value)) {
              isValid = false;
              errorMessage = `Cannot exceed ${ruleValue} characters`;
            }
            break;

          case 'pattern':
            if (ruleValue instanceof RegExp) {
              const result = validators.pattern(ruleValue)(value);
              if (result !== true) {
                isValid = false;
                errorMessage = result; // pattern returns the error message
              }
            }
            break;

          case 'email':
            if (ruleValue === true && !validators.isValidEmail(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid email address';
            }
            break;

          case 'url':
            if (ruleValue === true && !validators.isValidUrl(value)) {
              isValid = false;
              errorMessage = 'Please enter a valid URL';
            }
            break;

          case 'custom':
            // Custom validator function provided directly
            if (typeof ruleValue === 'function') {
              const result = ruleValue(value);
              if (result !== true) {
                isValid = false;
                errorMessage = typeof result === 'string' 
                  ? result 
                  : 'Invalid value';
              }
            }
            break;

          default:
            // Check for a matching validator function
            if (validators[rule] && typeof validators[rule] === 'function') {
              const validator = ruleValue === true 
                ? validators[rule] 
                : validators[rule](ruleValue);
              
              const result = validator(value);
              if (result !== true) {
                isValid = false;
                errorMessage = typeof result === 'string' 
                  ? result 
                  : `Failed ${rule} validation`;
              }
            }
            break;
        }

        // If validation failed, set the error and return false
        if (!isValid) {
          setFieldError(fieldName, errorMessage);
          return false;
        }
      }

      // All validations passed
      return true;
    } catch (error) {
      logger.error('Validation error:', error);
      setFieldError(fieldName, 'Validation error');
      return false;
    }
  }, [clearFieldError, setFieldError]);

  /**
   * Validate an entire form with field-by-field validation rules
   * @param {Object} formValues - Form values by field name
   * @param {Object} formValidationRules - Validation rules by field name
   * @returns {boolean} True if the entire form is valid
   */
  const validateForm = useCallback((formValues, formValidationRules) => {
    // Clear all previous errors
    clearErrors();

    if (!formValues || !formValidationRules) {
      return true; // No validation needed
    }

    let isFormValid = true;

    // Validate each field with rules
    Object.entries(formValidationRules).forEach(([fieldName, rules]) => {
      const value = formValues[fieldName];
      
      // Validate this field and track overall form validity
      const isFieldValid = validate(fieldName, value, rules);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validate, clearErrors]);

  // Context value
  const value = {
    errors,
    validate,
    validateForm,
    clearErrors,
    clearFieldError,
    setFieldError,
    getValidators
  };

  return (
    <ValidationContext.Provider value={value}>
      {children}
    </ValidationContext.Provider>
  );
};

/**
 * Hook to use the validation context
 * @returns {ValidationContextValue}
 */
export function useValidation() {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
}