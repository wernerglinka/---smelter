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
 */

/**
 * Text input field component with common field structure
 * @param {TextFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered field component
 */
export const TextField = ({ field }) => {
  const label = field.label || '';

  return (
    <BaseField
      field={field}
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
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
