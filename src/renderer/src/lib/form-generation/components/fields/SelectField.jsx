import React, { useCallback } from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} SelectOption
 * @property {string} label - Option display text
 * @property {string|number} value - Option value
 */

/**
 * @typedef {Object} SelectFieldProps
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Field label text
 * @property {string|number} [field.value] - Initial selected value
 * @property {SelectOption[]} [field.options] - Available options
 * @property {boolean} [field.noDuplication] - Whether field can be duplicated
 * @property {boolean} [field.noDeletion] - Whether field can be deleted
 * @property {Function} [onUpdate] - Handler for field value updates
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-select.has-error select.element-value {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
}

.form-element.is-select .field-error {
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
 * Select dropdown field component with common field structure
 * @param {SelectFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered field component
 */
export const SelectField = ({
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
  const options = field.options || [];
  
  // Access form operations context and error context
  const { setValue, validateField, validationErrors } = useFormOperations();
  const { handleError } = useError();
  
  // Check if this field has validation errors
  const hasError = validationErrors && validationErrors[field.id || field.name];

  // Handle select changes - should register immediately
  const handleSelectChange = useCallback((e) => {
    try {
      const newValue = e.target.value;
      
      // Update value in the form context
      setValue(field.name, newValue);
      
      // Validate if needed
      if (field.required) {
        validateField(field.name, (value) => value ? true : 'You must select an option');
      }
      
      // Call the original onUpdate handler if provided
      if (onUpdate && newValue !== field.value) {
        // Get an identifier - use either id or name as fallback
        const fieldId = field.id || field.name || `select_${Date.now()}`;

        // Create update object with required properties
        const updateObject = {
          id: fieldId,
          name: field.name,
          type: 'select', // Force the correct type
          value: newValue
        };

        // Only send the bare minimum with a valid ID
        onUpdate(updateObject);
      }
      
      logger.debug('Select field updated', {
        fieldId: field.id || field.name,
        name: field.name,
        value: newValue
      });
    } catch (error) {
      handleError(error, 'handleSelectChange');
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
        
        logger.debug('Select field label updated', {
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
        <span className="hint">Select for {label || 'field'}</span>
        <div>
          <select
            name={field.name}
            defaultValue={field.value}
            className={`element-value ${hasError ? 'has-error' : ''}`}
            onChange={handleSelectChange}
          >
            {options.length ? (
              options.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))
            ) : (
              <option value="">No options available</option>
            )}
          </select>
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
