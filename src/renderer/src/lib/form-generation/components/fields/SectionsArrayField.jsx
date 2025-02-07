import React from 'react';
import { useForm } from '@formsContext/FormContext';
import { DragHandleIcon, CollapseIcon, CollapsedIcon, AddIcon, DeleteIcon } from '@components/icons';
import { ObjectField } from './ObjectField';

export const SectionsArrayField = ({ field, implicitDef }) => {
  const { dispatch } = useForm();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="form-element is-array label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>Sections</span>
        <input
          type="text"
          className="element-label"
          placeholder="Array Name"
          value="Sections"
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <div
        className={`array-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-array"
        data-dropzone-type="sections"
      >
        {field.value && field.value.map((section, index) => (
          <ObjectField
            key={index}
            field={{
              ...section,
              label: section.name || `Section${index + 1}`,
              type: 'object'
            }}
            implicitDef={implicitDef}
          />
        ))}
      </div>
      <div className="button-wrapper">
        {!implicitDef?.noDuplication && (
          <div className="add-button button">
            <AddIcon />
          </div>
        )}
        {!implicitDef?.noDeletion && (
          <div className="delete-button">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};
