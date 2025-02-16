import React, { useState } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';

export const ObjectField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Process the object's value to ensure we have proper field definitions
  const renderFields = () => {
    // If we already have field definitions, use them
    if (field.fields) {
      return field.fields.map((childField, index) => (
        <FormField
          key={`${field.name}-${childField.name}-${index}`}
          field={childField}
        />
      ));
    }

    return null;
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
        {renderFields()}
      </div>
    </div>
  );
};
