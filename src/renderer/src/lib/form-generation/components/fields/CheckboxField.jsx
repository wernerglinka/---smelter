import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

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
export const CheckboxField = ({ field }) => {
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
        <span className="hint">Toggle for {label}</span>
        <div>
          <input
            type="checkbox"
            role="switch"
            className="checkbox-input"
            defaultChecked={field.value || false}
          />
        </div>
      </label>
    </BaseField>
  );
};
