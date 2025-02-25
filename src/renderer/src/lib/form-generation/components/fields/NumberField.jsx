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
export const NumberField = ({ field }) => {
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
        <span className="hint">Number for {label}</span>
        <div>
          <input
            type="number"
            className="element-value"
            defaultValue={field.value || ''}
            placeholder={`Enter ${label || 'number'}`}
          />
        </div>
      </label>
    </BaseField>
  );
};
