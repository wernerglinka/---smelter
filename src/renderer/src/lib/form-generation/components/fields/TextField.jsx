import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

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
  allowDuplication = !field?.noDuplication,
  allowDeletion = !field?.noDeletion
}) => {
  // Use _displayLabel for duplicated fields (with empty label but display text)
  // This allows the label to appear in the UI while still being editable
  const label = field._displayLabel || field.label || '';

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
        <span className="hint">Text for {label || 'field'}</span>
        <div>
          <input
            type="text"
            name={field.name}
            className="element-value"
            defaultValue={field.value}
            placeholder={field.placeholder}
          />
        </div>
      </label>
    </BaseField>
  );
};
