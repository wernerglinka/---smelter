import React from 'react';
import { DragHandleIcon, CollapseIcon, CollapsedIcon } from '@components/icons';
import { FormField } from '../FormField';
import { useForm } from '@formsContext/FormContext';

export const ObjectField = ({ field, implicitDef }) => {

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { state, dispatch } = useForm();

  // Ensure field has a base path
  const basePath = field.path || field.label;

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Process fields based on the field structure
  const fields = React.useMemo(() => {
    // If field.value is an array of field definitions, use them directly
    if (Array.isArray(field.value) && field.value[0]?.label) {
      return field.value.map((fieldDef, index) => ({
        ...fieldDef,
        id: `${field.id || field.label}-${fieldDef.label}`,
        path: `${basePath}.${fieldDef.label}`
      }));
    }

    if (Array.isArray(field.value)) {
      return field.value.map((fieldValue, index) => ({
        id: `${field.id || field.label}-${index}`,
        path: `${basePath}.${index}`,
        type: fieldValue.type || 'text',
        label: fieldValue.label || `Field ${index + 1}`,
        value: fieldValue.value || fieldValue,
        placeholder: fieldValue.placeholder || `Enter ${fieldValue.label || `Field ${index + 1}`}`
      }));
    }

    if (typeof field.value === 'object' && field.value !== null) {
      return Object.entries(field.value).map(([key, value]) => ({
        id: `${field.id || field.label}-${key}`,
        path: `${basePath}.${key}`,
        type: typeof value === 'object' ? (value.type || 'text') : 'text',
        label: key,
        value: typeof value === 'object' ? value.value : value,
        placeholder: `Enter ${key}`
      }));
    }

    return [];
  }, [field, basePath]);

  return (
    <div className="form-element is-object label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper label-exists">
        <span>{field.label}</span>
        <span className="hint">Object</span>
        <input
          type="text"
          className="element-label"
          placeholder="Label Placeholder"
          value={field.label}
          readOnly
        />
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
            key={`${field.id || field.label}-${subField.label}-${index}`}
            field={subField}
            implicitDef={implicitDef}
          />
        ))}
      </div>
    </div>
  );
};
