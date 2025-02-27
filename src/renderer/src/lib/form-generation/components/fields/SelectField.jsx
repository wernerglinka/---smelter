import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

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
export const SelectField = ({ field }) => {
  const label = field.label || '';
  const options = field.options || [];

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
        <span className="hint">Select for {label}</span>
        <div>
          <select
            name={field.name}
            defaultValue={field.value}
            className="element-value"
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
