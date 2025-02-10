import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon, AddIcon, DeleteIcon } from '@components/icons';
import { FormField } from '../FormField';

export const ArrayField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="form-element is-array label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon className="icon" />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Array Name"
          value={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon className="icon" /> : <CollapseIcon className="icon" />}
        </span>
      </label>
      <div
        className={`array-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-array"
      >
        {field.value && field.value.map((item, index) => (
          <div key={index} className="form-element is-object label-exists no-drop" draggable="true">
            <FormField
              field={{ name: `${field.name}[${index}]`, value: item }}
              onChange={(value) => handleItemChange(index, value)}
            />
          </div>
        ))}
      </div>
      <div className="button-wrapper">
        {!field?.noDuplication && (
          <div className="add-button button">
            <AddIcon className="icon" />
          </div>
        )}
        {!field?.noDeletion && (
          <div className="delete-button button">
            <DeleteIcon className="icon" />
          </div>
        )}
      </div>
    </div>
  );
};
