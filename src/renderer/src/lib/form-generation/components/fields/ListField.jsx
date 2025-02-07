import React, { useState } from 'react';
import { BaseField } from './BaseField';
import { useForm } from '@formsContext/FormContext';
import { DragHandleIcon, AddIcon, DeleteIcon, CollapseIcon, CollapsedIcon } from '@components/icons';

export const ListField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemChange = (index, value) => {
    const newValue = [...(field.value || [])];
    newValue[index] = value;
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: newValue }
    });
  };

  const handleAddItem = (index) => {
    const newValue = [...(field.value || [])];
    newValue.splice(index + 1, 0, '');
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: newValue }
    });
  };

  const handleDeleteItem = (index) => {
    const newValue = [...(field.value || [])];
    newValue.splice(index, 1);
    dispatch({
      type: 'UPDATE_FIELD',
      payload: { id: field.id, value: newValue }
    });
  };

  return (
    <div className="form-element is-list label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="label-wrapper object-name">
        <span>{field.label}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Label Placeholder"
          value={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div className={`list-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`} data-wrapper="is-list">
        <ul>
          {(field.value || []).map((item, index) => (
            <li key={index}>
              <input
                type="text"
                className="list-item"
                placeholder="Item Placeholder"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
              <div className="button-wrapper">
                <div className="add-button button" onClick={() => handleAddItem(index)}>
                  <AddIcon />
                </div>
                <div className="delete-button" onClick={() => handleDeleteItem(index)}>
                  <DeleteIcon />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="button-wrapper">
        <div className="add-button button" onClick={() => handleAddItem(field.value?.length || 0)}>
          <AddIcon />
        </div>
        <div className="delete-button">
          <DeleteIcon />
        </div>
      </div>
    </div>
  );
};
