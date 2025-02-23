import React, { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';

/**
 * Renders an object field that can contain multiple fields of different types
 * Supports drag and drop reordering and nested field structures
 *
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration object
 * @param {Function} props.onUpdate - Callback for field updates
 */
export const ObjectField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [fields, setFields] = useState(field.fields || []);

  const handleCollapse = () => setIsCollapsed(!isCollapsed);

  const displayLabel = field.fields?.find(f => f.name === 'sectionDescription')?.value || field.label;

  /**
   * Handles drag and drop events for object fields
   */
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        const fieldData = data.field || data;
        const newField = {
          ...fieldData,
          id: fieldData.id || `${field.id}_field_${fields.length}`,
          name: `${field.id}[${fields.length}]`,
          fields: fieldData.fields || []
        };

        setFields(currentFields => {
          const updatedFields = [...currentFields];
          if (typeof position.targetIndex === 'number') {
            updatedFields.splice(position.targetIndex, 0, newField);
          } else {
            updatedFields.push(newField);
          }
          return updatedFields;
        });
        break;
      }

      case 'reorder': {
        const { sourceIndex, targetIndex } = position;
        setFields(currentFields => {
          const newFields = [...currentFields];
          const [movedField] = newFields.splice(sourceIndex, 1);
          newFields.splice(targetIndex, 0, movedField);
          return newFields;
        });
        break;
      }
    }
  }, [field.id, fields.length]);

  /**
   * Handles drag start event for the object container
   */
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('origin', 'dropzone');
    e.dataTransfer.setData('application/json', JSON.stringify(field));
  }, [field]);

  return (
    <div
      className="form-element is-object no-drop label-exists"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper label-exists">
        <span>{field.label}<sup>*</sup></span>
        <input
          type="text"
          className="element-label"
          name={`${field.id}_label`}
          placeholder="Object Name"
          defaultValue={displayLabel}
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
        {fields.map((fieldItem, fieldIndex) => (
          <FormField
            key={`${fieldItem.id || fieldItem.name}-${fieldIndex}`}
            field={{
              ...fieldItem,
              name: `${field.id}[${fieldIndex}]${fieldItem.name ? `[${fieldItem.name}]` : ''}`
            }}
          />
        ))}
      </Dropzone>
    </div>
  );
};
