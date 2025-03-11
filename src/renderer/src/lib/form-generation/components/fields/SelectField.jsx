import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';

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
 */

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
  // Debug information about the field
  console.log('SelectField received field:', {
    id: field.id,
    name: field.name,
    type: field.type,
    hasOptions: !!field.options,
    optionsCount: field.options?.length
  });

  // Use _displayLabel for duplicated fields (with empty label but display text)
  // This allows the label to appear in the UI while still being editable
  const label = field._displayLabel || field.label || '';
  const options = field.options || [];

  // Handle select changes - should register immediately
  const handleSelectChange = (e) => {
    console.log('Select value changed:', {
      originalValue: field.value,
      newValue: e.target.value,
      fieldId: field.id,
      fieldType: field.type,
      normalizedType: field.type?.toLowerCase()
    });

    if (onUpdate && e.target.value !== field.value) {
      // Get an identifier - use either id or name as fallback
      const fieldId = field.id || field.name || `select_${Date.now()}`;

      // Create update object with required properties
      const updateObject = {
        id: fieldId,
        name: field.name,
        type: 'select', // Force the correct type
        value: e.target.value
      };

      console.log('Sending update with:', updateObject);

      // Only send the bare minimum with a valid ID
      onUpdate(updateObject);
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
            readOnly={!!label}
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Select for {label}</span>
        <div>
          <select
            name={field.name}
            defaultValue={field.value}
            className="element-value"
            onChange={handleSelectChange}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        </div>
      </label>
    </BaseField>
  );
};
