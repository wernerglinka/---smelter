import React from 'react';
import './styles.css';

/**
 * ValidationFeedback Component
 * 
 * Displays validation error messages with appropriate styling.
 * 
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='error'] - Feedback type (error, warning, info)
 * @returns {JSX.Element} The validation feedback component
 */
export const ValidationFeedback = ({ 
  message, 
  className = '',
  type = 'error'
}) => {
  if (!message) return null;
  
  return (
    <div className={`validation-feedback ${type} ${className}`}>
      <span className="feedback-icon">
        {type === 'error' && '⚠️'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
      </span>
      <span className="feedback-message">{message}</span>
    </div>
  );
};

export default ValidationFeedback;