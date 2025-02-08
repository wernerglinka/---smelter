import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon } from '@components/icons';
import { FormField } from '../FormField';
import { useForm } from '@formsContext/FormContext';

export const ObjectField = ({ field, implicitDef }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { state, dispatch } = useForm();

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Convert object value to fields array if not already done
  const fields = Array.isArray(field.fields)
    ? field.fields
    : Object.entries(field.value || {}).map(([key, value]) => ({
        id: `${field.id}-${key}`,
        label: key,
        value: value,
        type: typeof value === 'object' && value !== null ? 'object' :
              typeof value === 'boolean' ? 'checkbox' : 'text',
        path: `${field.path}.${key}`
      }));

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
        {fields.map((subField, index) => (
          <FormField
            key={`${field.id}-${subField.label}-${index}`}
            field={{
              ...subField,
              id: subField.id || `${field.id}-${subField.label}-${index}`,
              path: subField.path || `${field.path}.${subField.label}`
            }}
            implicitDef={implicitDef}
          />
        ))}
      </div>
    </div>
  );
};
