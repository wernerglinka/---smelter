import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon, AddIcon, DeleteIcon } from '@components/icons';
import { FormField } from '../FormField';

export const ArrayField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [collapsedFields, setCollapsedFields] = React.useState(new Set());

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleFieldCollapse = (fieldPath) => {
    setCollapsedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldPath)) {
        newSet.delete(fieldPath);
      } else {
        newSet.add(fieldPath);
      }
      return newSet;
    });
  };

  return (
    <div className="form-element is-array no-drop label-exists" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}<sup>*</sup></span>
        <input
          type="text"
          className="element-label"
          placeholder="Array Name"
          defaultValue={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div
        className={`array-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-array"
      >
        {(field.value || []).map((item, index) => {
          const itemPath = `${field.name}-${index}`;
          const isItemCollapsed = collapsedFields.has(itemPath);
          const itemFields = Array.isArray(field.fields) ? field.fields[index] : null;

          // If we have field definitions and they're valid, render as complex item
          if (itemFields && Array.isArray(itemFields)) {
            return (
              <div key={index} className="form-element is-object label-exists no-drop" draggable="true">
                <span className="sort-handle">
                  <DragHandleIcon />
                </span>
                <label className="object-name label-wrapper label-exists">
                  <span>{item.name || `Item ${index + 1}`}</span>
                  <input
                    type="text"
                    className="element-label"
                    defaultValue={item.name || `Item ${index + 1}`}
                    readOnly
                  />
                  <span className="collapse-icon" onClick={() => handleFieldCollapse(itemPath)}>
                    {isItemCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
                  </span>
                </label>
                <div className={`object-dropzone dropzone js-dropzone ${isItemCollapsed ? 'is-collapsed' : ''}`}>
                  {itemFields.map((childField, fieldIndex) => (
                    <FormField
                      key={`${itemPath}-field-${fieldIndex}`}
                      field={childField}
                    />
                  ))}
                </div>
              </div>
            );
          }

          // Otherwise render as simple item
          return (
            <div key={index} className="form-element label-exists no-drop" draggable="true">
              <FormField
                field={{
                  name: `${field.name}[${index}]`,
                  label: `Item ${index + 1}`,
                  value: item,
                  type: typeof item === 'string' ? 'text' : typeof item
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="button-wrapper">
        {!field?.noDuplication && (
          <div className="add-button button">
            <AddIcon />
          </div>
        )}
        {!field?.noDeletion && (
          <div className="delete-button button">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};
