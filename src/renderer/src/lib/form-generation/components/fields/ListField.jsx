import React from 'react';
import { BaseField } from './BaseField';
import { useForm } from '../../context/FormContext';
import { toTitleCase } from '../../utils';

export const ListField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();

  const handleItemChange = (index, value) => {
    const newValue = [...(field.value || [])];
    newValue[index] = value;
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: newValue }
    });
  };

  const handleAddItem = () => {
    const newValue = [...(field.value || []), ''];
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: newValue }
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
      <div className="content-wrapper">
        <span className="hint">List items</span>
        <ul>
          {(field.value || []).map((item, index) => (
            <li key={index}>
              <input
                type="text"
                className="list-item element-value"
                placeholder="Item value"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
            </li>
          ))}
        </ul>
        <button
          className="add-button button"
          onClick={handleAddItem}
          type="button"
        >
          Add Item
        </button>
      </div>
    </BaseField>
  );
};
