import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@utils/format/string';

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

  // Handle text value changes on blur (when user finishes editing)
  const handleTextBlur = (e) => {
    // Only trigger update if value actually changed
    if (onUpdate && e.target.value !== field.value) {
      // Only send the bare minimum - id and new value
      // Fall back to field.name if field.id is undefined
      onUpdate({
        id: field.id || field.name,
        name: field.name, // Always include name for fallback identification
        type: field.type?.toLowerCase(), // Normalize to lowercase
        value: e.target.value
      });
    }
  };

  // Handle label changes on blur when editable
  const handleLabelBlur = (e) => {
    if (onUpdate && field._displayLabel !== undefined && e.target.value !== field._displayLabel) {
      // Only send the bare minimum - id and new display label
      // Fall back to field.name if field.id is undefined
      onUpdate({
        id: field.id || field.name,
        name: field.name, // Always include name for fallback identification
        type: field.type?.toLowerCase(), // Normalize to lowercase
        _displayLabel: e.target.value
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
            className="element-value"
            defaultValue={field.value}
            placeholder={field.placeholder}
            onBlur={handleTextBlur}
          />
        </div>
      </label>
    </BaseField>
  );
};
