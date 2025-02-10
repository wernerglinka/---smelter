import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon, AddIcon, DeleteIcon } from '@components/icons';
import { FormField } from '../FormField';

export const SectionsArrayField = ({ field }) => {
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
        {(field.value || []).map((section, index) => {
          const sectionPath = `section${index}`;
          const isSectionCollapsed = collapsedFields.has(sectionPath);
          const sectionFields = field.fields[index] || [];

          return (
            <div key={index} className="form-element is-object label-exists no-drop" draggable="true">
              <span className="sort-handle">
                <DragHandleIcon />
              </span>
              <label className="object-name label-wrapper label-exists">
                <span>{section.name || `Section ${index + 1}`}</span>
                <input
                  type="text"
                  className="element-label"
                  defaultValue={section.name || `Section ${index + 1}`}
                  readOnly
                />
                <span className="collapse-icon" onClick={() => handleFieldCollapse(sectionPath)}>
                  {isSectionCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
                </span>
              </label>
              <div className={`object-dropzone dropzone js-dropzone ${isSectionCollapsed ? 'is-collapsed' : ''}`}>
                {sectionFields.map((childField, fieldIndex) => (
                  <FormField
                    key={`${sectionPath}-field-${fieldIndex}`}
                    field={childField}
                  />
                ))}
              </div>
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


