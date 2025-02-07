import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';
import { DragHandleIcon, AddIcon, DeleteIcon } from '@components/icons';

export const TextField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleChange = (value) => {
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value }
    });
  };

  return (
    <div className="form-element label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon className="icon" />
      </span>
      <label className="label-wrapper">
        <span>{toTitleCase(field.label)}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            value={field.label.toLowerCase()}
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
            placeholder={`Add ${field.label.toLowerCase()}`}
            value={field.value || ''}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </label>
      <div className="button-wrapper">
        {!implicitDef?.noDuplication && (
          <div className="add-button button">
            <AddIcon className="icon" />
          </div>
        )}
        {!implicitDef?.noDeletion && (
          <div className="delete-button">
            <DeleteIcon className="icon" />
          </div>
        )}
      </div>
    </div>
  );
};
