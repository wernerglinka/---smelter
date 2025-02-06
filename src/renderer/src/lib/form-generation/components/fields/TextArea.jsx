import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '../../context/FormContext';
import { toTitleCase } from '../../utils';

export const TextArea = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (value) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value }
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
        <span className="hint">Text for Textarea element</span>
        <div>
          <textarea
            className="element-value is-editor"
            placeholder={field.placeholder || implicitDef?.placeholder || "Click to open editor"}
            value={field.value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </label>
    </BaseField>
  );
};
