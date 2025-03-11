import React, { useEffect } from 'react';
import { useValidation } from '../../context/ValidationContext';
import ValidationFeedback from '../ValidationFeedback';
import './styles.css';

/**
 * FormField Component
 * 
 * A wrapper component that provides standardized validation feedback
 * for form fields. Connects with ValidationContext for field validations.
 * 
 * @param {Object} props
 * @param {string} props.name - Field name (used for validation)
 * @param {string} [props.label] - Field label
 * @param {boolean} [props.required] - Whether the field is required
 * @param {Object} [props.validationRules] - Validation rules for the field
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - The form control to be wrapped
 * @param {boolean} [props.showLabel=true] - Whether to show the label
 * @param {string} [props.helpText] - Optional help text to display
 * @returns {JSX.Element} The wrapped form field
 */
export const FormField = ({
  name,
  label,
  required = false,
  validationRules = {},
  className = '',
  children,
  showLabel = true,
  helpText
}) => {
  const { errors } = useValidation();
  const hasError = !!errors[name];
  
  // Add required to validation rules if specified
  useEffect(() => {
    if (required && !validationRules.required) {
      validationRules.required = true;
    }
  }, [required, validationRules]);

  return (
    <div className={`form-field ${hasError ? 'has-error' : ''} ${className}`}>
      {showLabel && label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className="form-control">
        {children}
        {helpText && <div className="help-text">{helpText}</div>}
        {hasError && <ValidationFeedback message={errors[name]} />}
      </div>
    </div>
  );
};

export default FormField;