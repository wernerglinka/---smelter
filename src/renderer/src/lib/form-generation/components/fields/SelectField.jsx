import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const SelectField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (value) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value }
    });
  };

  const options = implicitDef?.options || field.options || [];
  const currentValue = field.value || implicitDef?.default || '';

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
            value={field.label || ''}
            readOnly
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Select an option</span>
        <div>
          <select
            className="element-value"
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
          >
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </label>
    </BaseField>
  );
};
