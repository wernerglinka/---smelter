import React, { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import {
  DragHandleIcon,
  CollapsedIcon,
  CollapseIcon,
  AddIcon,
  DeleteIcon
} from '@components/icons';
import Dropzone from '@components/Dropzone';
import { StorageOperations } from '@services/storage';
import { processFrontmatter } from '../../processors/frontmatter-processor';

/**
 * Renders an object field that can contain multiple fields of different types
 * Supports drag and drop reordering and nested field structures
 *
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration object
 * @param {Function} props.onUpdate - Callback for field updates
 */
export const ObjectField = ({ field, allowDuplication = true, allowDeletion = true }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [fields, setFields] = useState(field.fields || []);

  const handleCollapse = () => setIsCollapsed(!isCollapsed);

  const displayLabel = field.fields?.find(f => f.name === 'sectionDescription')?.value || field.label;
  const originalName = field.name; // Store the original field name

  /**
   * Handles drag and drop events for object fields
   */
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    if (!data) return;

    switch (type) {
      case 'template': {
        try {
          const projectPath = await StorageOperations.getProjectPath();
          if (!projectPath) {
            throw new Error('Project path not found');
          }

          const templateUrl = data.url.replace(/^\/+|\/+$/g, '');
          const templatePath = `${projectPath}/.metallurgy/frontMatterTemplates/templates/${templateUrl}`;

          const result = await window.electronAPI.files.read(templatePath);
          if (result.status === 'failure') {
            throw new Error(`Failed to read template: ${result.error}`);
          }

          const templateData = typeof result.data === 'string' ?
            JSON.parse(result.data) : result.data;

          const schema = await processFrontmatter(templateData, '');

          setFields(currentFields => [...currentFields, {
            ...schema,
            id: `${field.id}_field_${currentFields.length}`
          }]);
        } catch (error) {
          console.error('Error processing template in object:', error);
        }
        break;
      }
      case 'sidebar': {
        const fieldData = data.field || data;
        setFields(currentFields => [...currentFields, {
          ...fieldData,
          id: `${field.id}_field_${currentFields.length}`
        }]);
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
              name: `${field.name}[${fieldIndex}]${fieldItem.name ? `[${fieldItem.name}]` : ''}`
            }}
          />
        ))}
      </Dropzone>
      <div className="button-wrapper">
        {allowDuplication && (
          <div className="add-button" title="Duplicate this object">
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div className="delete-button" title="Delete this object">
            <DeleteIcon />
          </div>
        )}
      </div>
      <input type="hidden" name={originalName} value={field.value} />
    </div>
  );
};
