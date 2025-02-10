import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon, AddIcon, DeleteIcon } from '@components/icons';
import { FormField } from '../FormField';

export const SectionsArrayField = ({ field, schema, implicitDef }) => {
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

  const renderObjectField = (fieldData, path = '') => {
    return Object.entries(fieldData).map(([key, value]) => {
      const fieldPath = `${path}${key}`;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const isFieldCollapsed = collapsedFields.has(fieldPath);

        return (
          <div key={key} className="form-element is-object label-exists no-drop" draggable="true">
            <span className="sort-handle">
              <DragHandleIcon />
            </span>
            <label className="object-name label-wrapper label-exists">
              <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="text"
                className="element-label"
                defaultValue={key}
                readOnly
              />
              <span className="collapse-icon" onClick={() => handleFieldCollapse(fieldPath)}>
                {isFieldCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
              </span>
            </label>
            <div className={`object-dropzone dropzone js-dropzone ${isFieldCollapsed ? 'is-collapsed' : ''}`}>
              {renderObjectField(value, `${fieldPath}.`)}
            </div>
          </div>
        );
      }

      // Let FormField handle the field type determination based on schema
      return (
        <FormField
          key={key}
          field={{
            name: key,
            value: value,
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
          }}
          schema={schema}
          implicitDef={implicitDef}
        />
      );
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
                {renderObjectField(section, `${sectionPath}.`)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="button-wrapper">
        {!implicitDef?.noDuplication && (
          <div className="add-button button">
            <AddIcon />
          </div>
        )}
        {!implicitDef?.noDeletion && (
          <div className="delete-button button">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};


