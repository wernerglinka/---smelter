import React, { useCallback } from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} NumberFieldProps
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Field label text
 * @property {number} [field.value] - Initial number value
 * @property {number} [field.min] - Minimum allowed value
 * @property {number} [field.max] - Maximum allowed value
 * @property {number} [field.step] - Step increment value
 * @property {boolean} [field.noDuplication] - Whether field can be duplicated
 * @property {boolean} [field.noDeletion] - Whether field can be deleted
 * @property {Function} [onUpdate] - Handler for field value updates
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-number.has-error input.element-value {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
}

.form-element.is-number .field-error {
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
 * Number input field component with common field structure
 * @param {NumberFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered field component
 */
export const NumberField = ({
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

  // Handle number value changes on blur
  const handleNumberBlur = useCallback((e) => {
    try {
      const newValue = e.target.value === '' ? '' : Number(e.target.value);
      
      // Update value in the form context
      setValue(field.name, newValue);
      
      // Validate value if needed
      if (field.required && (e.target.value === '' || isNaN(newValue))) {
        validateField(field.name, (value) => value !== '' && !isNaN(value) ? true : 'This field requires a valid number');
      }
      
      if (field.min !== undefined && newValue < field.min) {
        validateField(field.name, (value) => value >= field.min ? true : `Value must be at least ${field.min}`);
      }
      
      if (field.max !== undefined && newValue > field.max) {
        validateField(field.name, (value) => value <= field.max ? true : `Value must not exceed ${field.max}`);
      }
      
      // Only update if value has changed
      if (onUpdate && newValue !== field.value) {
        // Only send the bare minimum - id and new value
        onUpdate({
          id: field.id || field.name,
          name: field.name, // Always include name for fallback identification
          type: field.type?.toLowerCase(), // Normalize to lowercase
          value: newValue
        });
        
        logger.debug('Number field updated', {
          fieldId: field.id || field.name,
          name: field.name,
          value: newValue
        });
      }
    } catch (error) {
      handleError(error, 'handleNumberBlur');
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
        
        logger.debug('Number field label updated', {
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
        <span className="hint">Number for {label || 'field'}</span>
        <div>
          <input
            type="number"
            name={field.name}
            className={`element-value ${hasError ? 'has-error' : ''}`}
            defaultValue={field.value || ''}
            placeholder={`Enter ${label || 'number'}`}
            min={field.min}
            max={field.max}
            step={field.step}
            onBlur={handleNumberBlur}
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
