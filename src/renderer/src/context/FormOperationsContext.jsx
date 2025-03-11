import React, { createContext, useContext, useCallback, useState } from 'react';
import { useError } from './ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} FormField
 * @property {string} id - Field ID
 * @property {string} name - Field name
 * @property {string} type - Field type
 * @property {any} value - Field value
 */

/**
 * @typedef {Object} FormOperationsContextValue
 * @property {Function} getValue - Get value from form field
 * @property {Function} setValue - Set value in form field
 * @property {Function} duplicateField - Duplicate a field (for arrays)
 * @property {Function} deleteField - Delete a field (for arrays)
 * @property {Function} validateField - Validate a field
 * @property {Function} getFormData - Get all form data
 * @property {Object} validationErrors - Current validation errors
 */

export const FormOperationsContext = createContext(null);

/**
 * Provider for form operations
 * Maintains uncontrolled form behavior while providing consistent operations
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components 
 * @param {string} props.formId - Optional form ID for targeting specific form
 */
export const FormOperationsProvider = ({ children, formId = 'form' }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const { handleError } = useError();

  /**
   * Get a form field element by name
   * @param {string} name - Field name
   * @returns {HTMLElement|null} - Form field element
   */
  const getField = useCallback((name) => {
    const form = document.getElementById(formId);
    if (!form) return null;
    
    return form.elements[name] || null;
  }, [formId]);

  /**
   * Get value from a form field
   * @param {string} name - Field name 
   * @returns {any} - Field value
   */
  const getValue = useCallback((name) => {
    const field = getField(name);
    if (!field) return null;

    // Handle different field types
    if (field.type === 'checkbox') return field.checked;
    if (field.type === 'file') return field.files;
    
    // For select-multiple, return array of values
    if (field.type === 'select-multiple') {
      return Array.from(field.selectedOptions).map(option => option.value);
    }

    return field.value;
  }, [getField]);

  /**
   * Set value in a form field
   * @param {string} name - Field name
   * @param {any} value - Value to set
   * @returns {boolean} - Whether the field was found and updated
   */
  const setValue = useCallback((name, value) => {
    try {
      // Guard against undefined or null names
      if (!name) {
        logger.warn('Attempted to set value for undefined field name');
        return false;
      }
      
      const field = getField(name);
      if (!field) {
        // Just a debug message instead of warning to reduce noise during initial form loading
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Field not found in DOM: ${name}`, { attemptedValue: value });
        }
        return false;
      }

      // Handle different field types
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else if (field.type === 'select-multiple' && Array.isArray(value)) {
        // For multi-select, update selected options
        Array.from(field.options).forEach(option => {
          option.selected = value.includes(option.value);
        });
      } else {
        field.value = value;
      }

      // Dispatch change event to trigger any listeners
      field.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Clear validation error if any
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
      
      return true;
    } catch (error) {
      handleError(error, 'setValue');
      return false;
    }
  }, [getField, handleError, validationErrors]);

  /**
   * Duplicate a field (for array fields)
   * This triggers a custom event that array components listen for
   * 
   * @param {string} arrayFieldName - Name of the array field
   * @param {number} index - Index to duplicate
   */
  const duplicateField = useCallback((arrayFieldName, index) => {
    try {
      const form = document.getElementById(formId);
      if (!form) return;

      // Create and dispatch a custom event for duplication
      const event = new CustomEvent('field:duplicate', {
        bubbles: true,
        detail: { fieldName: arrayFieldName, index }
      });
      form.dispatchEvent(event);
    } catch (error) {
      handleError(error, 'duplicateField');
    }
  }, [formId, handleError]);

  /**
   * Delete a field (for array fields)
   * This triggers a custom event that array components listen for
   * 
   * @param {string} arrayFieldName - Name of the array field
   * @param {number} index - Index to delete
   */
  const deleteField = useCallback((arrayFieldName, index) => {
    try {
      const form = document.getElementById(formId);
      if (!form) return;

      // Create and dispatch a custom event for deletion
      const event = new CustomEvent('field:delete', {
        bubbles: true,
        detail: { fieldName: arrayFieldName, index }
      });
      form.dispatchEvent(event);
    } catch (error) {
      handleError(error, 'deleteField');
    }
  }, [formId, handleError]);

  /**
   * Validate a specific field
   * @param {string} name - Field name
   * @param {Function} validationFn - Validation function
   * @param {boolean} [skipIfMissing=true] - Skip validation if field is not found
   * @returns {boolean} - Validation result
   */
  const validateField = useCallback((name, validationFn, skipIfMissing = true) => {
    try {
      // Guard against undefined field names
      if (!name) {
        logger.warn('Attempted to validate undefined field name');
        return false;
      }
      
      // Check if field exists in DOM
      const field = getField(name);
      if (!field && skipIfMissing) {
        // Skip validation for fields not in DOM (likely not rendered yet)
        if (process.env.NODE_ENV === 'development') {
          logger.debug(`Skipping validation for field not in DOM: ${name}`);
        }
        return true;
      }
      
      const value = getValue(name);
      
      // Skip validation if no validation function provided
      if (typeof validationFn !== 'function') {
        logger.warn(`Invalid validation function for field: ${name}`);
        return true;
      }
      
      const validationResult = validationFn(value);
      
      if (validationResult !== true) {
        // Store validation error
        setValidationErrors(prev => ({
          ...prev,
          [name]: validationResult
        }));
        return false;
      }
      
      // Clear validation error if previously set
      if (validationErrors[name]) {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
      
      return true;
    } catch (error) {
      handleError(error, 'validateField');
      return false;
    }
  }, [getField, getValue, handleError, validationErrors]);

  /**
   * Get all form data
   * @returns {FormData} - FormData object
   */
  const getFormData = useCallback(() => {
    try {
      const form = document.getElementById(formId);
      if (!form) {
        throw new Error(`Form with ID "${formId}" not found`);
      }
      return new FormData(form);
    } catch (error) {
      handleError(error, 'getFormData');
      return new FormData();
    }
  }, [formId, handleError]);

  const value = {
    getValue,
    setValue,
    duplicateField,
    deleteField,
    validateField,
    getFormData,
    validationErrors
  };

  return (
    <FormOperationsContext.Provider value={value}>
      {children}
    </FormOperationsContext.Provider>
  );
};

/**
 * Hook to access form operations context
 * @returns {FormOperationsContextValue}
 */
export function useFormOperations() {
  const context = useContext(FormOperationsContext);
  if (!context) {
    throw new Error('useFormOperations must be used within a FormOperationsProvider');
  }
  return context;
}