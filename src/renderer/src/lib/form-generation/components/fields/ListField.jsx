import React from 'react';
import { DragHandleIcon, AddIcon, DeleteIcon, CollapseIcon, CollapsedIcon } from '@components/icons';

export const ListField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemChange = (index, e) => {
    const newValue = [...(field.value || [])];
    newValue[index] = e.target.value;
    onChange?.(newValue);
  };

  const handleAddItem = (index) => {
    const newValue = [...(field.value || [])];
    newValue.splice(index + 1, 0, '');
    onChange?.(newValue);
  };

  const handleDeleteItem = (index) => {
    const newValue = [...(field.value || [])];
    newValue.splice(index, 1);
    onChange?.(newValue);
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
                value={item}
                onChange={(e) => handleItemChange(index, e)}
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
    </div>
  );
};
