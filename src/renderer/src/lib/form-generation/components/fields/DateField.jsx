import React, { useCallback } from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-date.has-error input.element-value {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
}

.form-element.is-date .field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  padding: 4px 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

/**
 * Formats a date string to be compatible with HTML date input
 * @param {string} dateString - The input date string
 * @returns {string} Date formatted as YYYY-MM-DD
 */
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }

  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

/**
 * Date input field component with common field structure
 * @param {Object} props - Component properties
 * @param {Object} props.field - Field configuration object
 * @param {string} props.field.name - Input field name
 * @param {string} [props.field.label] - Field label text
 * @param {string} [props.field.value] - Initial date value
 * @param {boolean} [props.field.noDuplication] - Whether field can be duplicated
 * @param {boolean} [props.field.noDeletion] - Whether field can be deleted
 * @param {Function} [props.onDuplicate] - Handler for field duplication
 * @param {Function} [props.onDelete] - Handler for field deletion
 * @param {Function} [props.onUpdate] - Handler for field value updates
 * @param {boolean} [props.allowDuplication] - Whether duplication is allowed
 * @param {boolean} [props.allowDeletion] - Whether deletion is allowed
 * @returns {JSX.Element} Rendered field component
 */
export const DateField = ({
  field,
  onDuplicate,
  onDelete,
  onUpdate,
  allowDuplication = !field?.noDuplication,
  allowDeletion = !field?.noDeletion
}) => {
  // Use _displayLabel for duplicated fields (with empty label but display text)
  // This allows the label to appear in the UI while still being editable
  const label = field._displayLabel || field.label || '';
  const formattedDate = formatDateForInput(field.value);
  
  // Access form operations context and error context
  const { setValue, validateField, validationErrors } = useFormOperations();
  const { handleError } = useError();
  
  // Check if this field has validation errors
  const hasError = validationErrors && validationErrors[field.id || field.name];

  // Handle date changes on blur
  const handleDateBlur = useCallback((e) => {
    try {
      const newValue = e.target.value;
      
      // Update value in the form context
      setValue(field.name, newValue);
      
      // Validate if needed
      if (field.required && !newValue) {
        validateField(field.name, (value) => value ? true : 'This field is required');
      }
      
      if (onUpdate && newValue !== formattedDate) {
        // Only send the bare minimum - id and new value
        onUpdate({
          id: field.id || field.name,
          name: field.name, // Always include name for fallback identification
          type: field.type?.toLowerCase(), // Normalize to lowercase
          value: newValue
        });
        
        logger.debug('Date field updated', {
          fieldId: field.id || field.name,
          name: field.name,
          value: newValue
        });
      }
    } catch (error) {
      handleError(error, 'handleDateBlur');
    }
  }, [field, onUpdate, formattedDate, setValue, validateField, handleError]);
  
  // Handle label changes on blur when editable
  const handleLabelBlur = useCallback((e) => {
    try {
      const newLabel = e.target.value;
      
      if (field._displayLabel !== undefined && newLabel !== field._displayLabel) {
        // Call the original onUpdate handler if provided
        if (onUpdate) {
          onUpdate({
            id: field.id || field.name,
            name: field.name,
            type: field.type?.toLowerCase(),
            _displayLabel: newLabel
          });
        }
        
        logger.debug('Date field label updated', {
          fieldId: field.id || field.name,
          name: field.name,
          label: newLabel
        });
      }
    } catch (error) {
      handleError(error, 'handleLabelBlur');
    }
  }, [field, onUpdate, handleError]);

  return (
    <BaseField
      field={field}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      allowDuplication={allowDuplication}
      allowDeletion={allowDeletion}
      hasError={hasError}
    >
      <label className="label-wrapper">
        <span>{toTitleCase(label) || 'Label'}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            defaultValue={label}
            readOnly={!field._displayLabel && !!label}
            onBlur={handleLabelBlur}
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Date for {label || 'field'}</span>
        <div>
          <input
            type="date"
            name={field.name}
            className={`element-value ${hasError ? 'has-error' : ''}`}
            defaultValue={formattedDate}
            placeholder={`Enter ${label || 'date'}`}
            onBlur={handleDateBlur}
          />
          {hasError && (
            <div className="field-error">
              {validationErrors[field.id || field.name]}
            </div>
          )}
        </div>
      </label>
    </BaseField>
  );
};
