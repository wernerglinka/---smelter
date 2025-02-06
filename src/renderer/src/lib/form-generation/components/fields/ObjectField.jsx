import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon } from '../../../../components/icons';
import { FormField } from '../FormField';

export const ObjectField = ({ field, implicitDef }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="form-element is-object label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Label Placeholder"
          value={field.label}
          readOnly
        />
        <span className="hint">Sections Object</span>
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div
        className={`object-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-object"
      >
        {field.value?.map((subField, index) => (
          <FormField
            key={index}
            field={subField}
            implicitDef={implicitDef}
          />
        ))}
      </div>
    </div>
  );
};
