import React from 'react';
import { DragHandleIcon, AddIcon, DeleteIcon, CollapseIcon, CollapsedIcon } from '@components/icons';

export const ListField = ({ field = {}, allowDuplication = true, allowDeletion = true }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);
  const [items, setItems] = React.useState(field.value || []);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleAddItem = (index) => {
    const newItems = [...items];
    const itemToClone = newItems[index];
    newItems.splice(index + 1, 0, `Copy of ${itemToClone}`);
    setItems(newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <div className="form-element is-list label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="label-wrapper object-name">
        <span>{field.label || ''}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Label Placeholder"
          defaultValue={field.label || ''}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div className={`list-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`} data-wrapper="is-list">
        <ul>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="list-item">
              <input
                type="text"
                defaultValue={item || ''}
              />
              <div className="button-wrapper">
                {allowDuplication && (
                  <div className="add-button" title="Duplicate this list" onClick={() => handleAddItem(index)}>
                    <AddIcon />
                  </div>
                )}
                {allowDeletion && (
                  <div className="delete-button" title="Delete this list" onClick={() => handleDeleteItem(index)}>
                    <DeleteIcon />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
