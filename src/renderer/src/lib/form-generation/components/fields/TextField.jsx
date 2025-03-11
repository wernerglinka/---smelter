import React, { useCallback } from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} TextFieldProps
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Field label text
 * @property {string} [field.value] - Initial field value
 * @property {string} [field.placeholder] - Input placeholder text
 * @property {boolean} [field.noDuplication] - Whether field can be duplicated
 * @property {boolean} [field.noDeletion] - Whether field can be deleted
 * @property {Function} [onDuplicate] - Handler for field duplication
 * @property {Function} [onDelete] - Handler for field deletion
 * @property {Function} [onUpdate] - Handler for field value updates
 * @property {boolean} [allowDuplication] - Whether duplication is allowed
 * @property {boolean} [allowDeletion] - Whether deletion is allowed
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-text.has-error input.element-value {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
}

.form-element.is-text .field-error {
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
 * Text input field component with common field structure
 * @param {TextFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered field component
 */
export const TextField = ({
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
  
  // Access form operations context and error context
  const { setValue, validateField, validationErrors } = useFormOperations();
  const { handleError } = useError();
  
  // Check if this field has validation errors
  const hasError = validationErrors && validationErrors[field.id || field.name];

  // Handle text value changes on blur (when user finishes editing)
  const handleTextBlur = useCallback((e) => {
    try {
      const newValue = e.target.value;
      
      // Only trigger update if value actually changed
      if (newValue !== field.value) {
        // Update value in the form context
        setValue(field.name, newValue);
        
        // Validate if needed
        if (field.required && !newValue) {
          validateField(field.name, (value) => value ? true : 'This field is required');
        }
        
        // Call the original onUpdate handler if provided
        if (onUpdate) {
          onUpdate({
            id: field.id || field.name,
            name: field.name,
            type: field.type?.toLowerCase(),
            value: newValue
          });
        }
        
        logger.debug('Text field updated', {
          fieldId: field.id || field.name,
          name: field.name,
          value: newValue
        });
      }
    } catch (error) {
      handleError(error, 'handleTextBlur');
    }
  }, [field, onUpdate, setValue, validateField, handleError]);

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
        
        logger.debug('Text field label updated', {
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
        <span className="hint">Text for {label || 'field'}</span>
        <div>
          <input
            type="text"
            name={field.name}
            className={`element-value ${hasError ? 'has-error' : ''}`}
            defaultValue={field.value}
            placeholder={field.placeholder}
            onBlur={handleTextBlur}
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
