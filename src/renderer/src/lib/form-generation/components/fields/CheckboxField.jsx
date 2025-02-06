import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '../../context/FormContext';
import { toTitleCase } from '../../utils';

export const CheckboxField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (checked) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: checked }
    });
  };

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
        <span className="hint">Initial state of checkbox</span>
        <div>
          <input
            type="checkbox"
            role="switch"
            className="element-value"
            checked={field.value || false}
            onChange={(e) => handleChange(e.target.checked)}
          />
        </div>
      </label>
    </BaseField>
  );
};
