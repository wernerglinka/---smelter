import React, { useState } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';

export const ObjectField = ({ field }) => {
  const [ isCollapsed, setIsCollapsed ] = useState( false );

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="form-element is-object">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Object Name"
          value={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div className={`object-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}>
        {field.fields?.map((childField, index) => (
          <FormField
            key={`${childField.label}-${index}`}
            field={childField}
          />
        ))}
      </div>
    </div>
  );
};
