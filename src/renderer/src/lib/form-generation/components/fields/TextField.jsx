import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';
import { DragHandleIcon } from '@components/icons';

export const TextField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (e) => {
    console.log('TextField handleChange:', {
      id: field.id,
      value: e.target.value,
      field
    });

    if (!field.id) {
      console.warn('Field is missing ID:', field);
      return;
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        id: field.id,
        value: e.target.value,
        path: field.path // Add path for nested fields
      }
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
          <input
            type="text"
            className="element-value"
            placeholder={field.placeholder || `Enter ${field.label}`}
            value={field.value || ''}
            onChange={handleChange}
          />
        </div>
      </label>
    </BaseField>
  );
};
