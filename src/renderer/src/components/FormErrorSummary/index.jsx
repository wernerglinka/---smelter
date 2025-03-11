import React from 'react';
import { useValidation } from '../../context/ValidationContext';
import './styles.css';

/**
 * FormErrorSummary Component
 * 
 * Displays all validation errors from the ValidationContext in a formatted list
 * 
 * @param {Object} props
 * @param {string} [props.title="Validation Errors"] - Title for the error summary
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element|null} The error summary component or null if no errors
 */
export const FormErrorSummary = ({ 
  title = "Please fix the following errors:", 
  className = '' 
}) => {
  const { errors } = useValidation();
  const errorCount = Object.keys(errors).length;
  
  // Don't render anything if there are no errors
  if (errorCount === 0) {
    return null;
  }
  
  return (
    <div className={`form-error-summary ${className}`}>
      <h3 className="error-summary-title">
        {title}
      </h3>
      <ul className="error-list">
        {Object.entries(errors).map(([fieldName, errorMessage]) => (
          <li key={fieldName} className="error-item">
            <span className="field-name">
              {fieldName}:
            </span>
            <span className="error-message">
              {errorMessage}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FormErrorSummary;