import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const SelectField = ({ field }) => {
  const label = field.label || field.name || '';
  const options = field.options || [];

  return (
    <BaseField
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
            defaultValue={field.value || field?.default || ''}
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
