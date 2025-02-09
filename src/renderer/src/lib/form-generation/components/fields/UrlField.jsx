import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const UrlField = ({ field, implicitDef }) => {
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
        <span className="hint">URL input</span>
        <div>
          <input
            type="url"
            className="element-value"
            placeholder={field.placeholder || implicitDef?.placeholder || "Enter a URL"}
            value={field.value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </label>
    </BaseField>
  );
};