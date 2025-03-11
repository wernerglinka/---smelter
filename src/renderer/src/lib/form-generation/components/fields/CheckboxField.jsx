import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';

/**
 * @typedef {Object} CheckboxFieldProps
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Field label text
 * @property {boolean} [field.value] - Initial checked state
 * @property {boolean} [field.noDuplication] - Whether field can be duplicated
 * @property {boolean} [field.noDeletion] - Whether field can be deleted
 */

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

  // Handle checkbox changes - these should update immediately
  const handleCheckboxChange = (e) => {
    if (onUpdate) {
      // Only send the bare minimum - id and new value
      // Fall back to field.name if field.id is undefined
      onUpdate({
        id: field.id || field.name,
        name: field.name, // Always include name for fallback identification
        type: field.type?.toLowerCase(), // Normalize to lowercase
        value: e.target.checked
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
            readOnly={!!label}
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Toggle for {label}</span>
        <div>
          <input
            type="checkbox"
            role="switch"
            name={field.name}
            className="checkbox-input element-value"
            defaultChecked={field.value || false}
            onChange={handleCheckboxChange}
          />
        </div>
      </label>
    </BaseField>
  );
};
