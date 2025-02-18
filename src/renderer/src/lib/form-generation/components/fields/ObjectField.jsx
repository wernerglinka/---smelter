import React, { useState, useCallback, useEffect } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';

export const ObjectField = ({ field, onUpdate, index }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add useEffect to monitor field changes
  useEffect(() => {
    console.log('ObjectField rendered with field:', field);
    console.log('ObjectField fields array:', field.fields);
  }, [field]);

  const handleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    console.log('ObjectField handleDropzoneEvent:', { type, data, position });
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        console.log('ObjectField sidebar case - incoming data:', data);
        const fieldData = data.field || data;
        const currentFields = field.fields || [];
        console.log('ObjectField current fields:', currentFields);

        // Initialize the field properly
        const newField = {
          ...fieldData,
          id: fieldData.id || `${field.id}_field_${currentFields.length}`,
          fields: fieldData.fields || []
        };
        console.log('ObjectField newField created:', newField);

        // Add new field at specified position or end
        const updatedFields = [...currentFields];
        if (typeof position.targetIndex === 'number') {
          updatedFields.splice(position.targetIndex, 0, newField);
        } else {
          updatedFields.push(newField);
        }
        console.log('ObjectField updatedFields:', updatedFields);

        // Log the update payload
        const updatePayload = {
          ...field,
          fields: updatedFields
        };
        console.log('ObjectField update payload:', updatePayload);

        onUpdate(field.id, updatePayload);
        console.log('ObjectField after update:', field.id, updatedFields);
        break;
      }

      case 'reorder': {
        console.log('ObjectField reorder case:', position);
        const { sourceIndex, targetIndex } = position;
        if (field.fields) {
          const newFields = [...field.fields];
          const [movedField] = newFields.splice(sourceIndex, 1);
          newFields.splice(targetIndex, 0, movedField);
          onUpdate(field.id, { ...field, fields: newFields });
          console.log('ObjectField after reorder:', newFields);
        }
        break;
      }
    }
  }, [field, onUpdate]);

  const handleDragStart = useCallback((e) => {
    console.log('ObjectField handleDragStart:', field);
    e.dataTransfer.setData('origin', 'dropzone');
    e.dataTransfer.setData('application/json', JSON.stringify(field));
  }, [field]);

  console.log('ObjectField rendering with fields:', field.fields);

  return (
    <div
      className="form-element is-object"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>{field.label}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Object Name"
          defaultValue={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
      <Dropzone
        className={`object-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-object"
        onDrop={handleDropzoneEvent}
      >
        {field.fields?.map((fieldItem, fieldIndex) => {
          console.log('Mapping field item:', fieldItem);
          return (
            <FormField
              key={`${fieldItem.id || fieldItem.name}-${fieldIndex}`}
              field={fieldItem}
              onUpdate={(fieldId, newValue) =>
                onUpdate(field.id, {
                  ...field,
                  fields: field.fields.map(f =>
                    f.id === fieldId ? { ...f, ...newValue } : f
                  )
                })
              }
              index={fieldIndex}
            />
          );
        })}
      </Dropzone>
    </div>
  );
};
