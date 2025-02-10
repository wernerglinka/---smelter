import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const SelectField = ({ field, implicitDef }) => {
  const options = implicitDef?.options || field.options || [];

  return (
    <BaseField
      field={field}
      allowDuplication={!implicitDef?.noDuplication}
      allowDeletion={!implicitDef?.noDeletion}
    >
      <label className="label-wrapper">
        <span>{toTitleCase(field.label)}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            defaultValue={field.label || ''}
            readOnly
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Select for {field.label}</span>
        <div>
          <select
            name={field.name}
            defaultValue={field.value || implicitDef?.default || ''}
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
