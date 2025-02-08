import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';
import { DragHandleIcon, AddIcon, DeleteIcon } from '@components/icons';

export const TextField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (e) => {
    if (!field.id) {
      console.warn('Field is missing ID:', field);
      return;
    }

    dispatch({
      type: 'UPDATE_FIELD',
      payload: {
        id: field.id,
        value: e.target.value,
        path: field.path,
        label: field.label  // Add this to preserve the label
      }
    });
  };

  // Get the actual label and value, handling nested objects
  const fieldLabel = field.label || (field.implicitDef && field.implicitDef.label) || '';
  const fieldValue = typeof field.value === 'object' ? '' : (field.value || '');

  return (
    <div className="form-element null label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="label-wrapper">
        <span>{toTitleCase(fieldLabel)}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            value={fieldLabel}
            readOnly
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Text for Text element</span>
        <div>
          <input
            type="text"
            className="element-value"
            placeholder={field.placeholder || `Enter ${fieldLabel}`}
            value={fieldValue}
            onChange={handleChange}
          />
        </div>
      </label>
      <div className="button-wrapper">
        <div className="add-button button">
          <AddIcon />
        </div>
        <div className="delete-button">
          <DeleteIcon />
        </div>
      </div>
    </div>
  );
};
