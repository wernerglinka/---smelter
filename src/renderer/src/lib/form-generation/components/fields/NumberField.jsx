import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

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
 */

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
  
  // Handle number value changes on blur
  const handleNumberBlur = (e) => {
    const newValue = e.target.value === '' ? '' : Number(e.target.value);
    // Only update if value has changed
    if (onUpdate && newValue !== field.value) {
      // Only send the bare minimum - id and new value
      // Fall back to field.name if field.id is undefined
      onUpdate({
        id: field.id || field.name,
        name: field.name, // Always include name for fallback identification
        type: field.type?.toLowerCase(), // Normalize to lowercase
        value: newValue
      });
    }
  };

  return (
    <BaseField
      field={field}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      allowDuplication={allowDuplication}
      allowDeletion={allowDeletion}
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
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Number for {label}</span>
        <div>
          <input
            type="number"
            name={field.name}
            className="element-value"
            defaultValue={field.value || ''}
            placeholder={`Enter ${label || 'number'}`}
            onBlur={handleNumberBlur}
          />
        </div>
      </label>
    </BaseField>
  );
};
