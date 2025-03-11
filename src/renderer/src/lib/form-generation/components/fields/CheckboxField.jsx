import React, { useCallback } from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} CheckboxFieldProps
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Field label text
 * @property {boolean} [field.value] - Initial checked state
 * @property {boolean} [field.noDuplication] - Whether field can be duplicated
 * @property {boolean} [field.noDeletion] - Whether field can be deleted
 * @property {Function} [onUpdate] - Handler for field value updates
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-checkbox.has-error .checkbox-input {
  outline: 2px solid #e74c3c;
}

.form-element.is-checkbox .field-error {
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
 * Checkbox field component with common field structure
 * @param {CheckboxFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered field component
 */
export const CheckboxField = ({
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

  // Handle checkbox changes - these should update immediately
  const handleCheckboxChange = useCallback((e) => {
    try {
      const newValue = e.target.checked;
      
      // Update value in the form context
      setValue(field.name, newValue);
      
      // Note: checkboxes typically don't validate to show errors,
      // but we could implement custom validation if needed
      if (field.required) {
        validateField(field.name, (value) => value === true ? true : 'This checkbox must be checked');
      }
      
      if (onUpdate) {
        // Only send the bare minimum - id and new value
        onUpdate({
          id: field.id || field.name,
          name: field.name, // Always include name for fallback identification
          type: field.type?.toLowerCase(), // Normalize to lowercase
          value: newValue
        });
        
        logger.debug('Checkbox field updated', {
          fieldId: field.id || field.name,
          name: field.name,
          value: newValue
        });
      }
    } catch (error) {
      handleError(error, 'handleCheckboxChange');
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
        
        logger.debug('Checkbox field label updated', {
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
        <span className="hint">Toggle for {label || 'field'}</span>
        <div>
          <input
            type="checkbox"
            role="switch"
            name={field.name}
            className={`checkbox-input element-value ${hasError ? 'has-error' : ''}`}
            defaultChecked={field.value || false}
            onChange={handleCheckboxChange}
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
