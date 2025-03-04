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
import FieldControls from './FieldControls';

/**
 * Renders an object field that can contain multiple fields of different types
 * Supports drag and drop reordering and nested field structures
 *
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration object
 * @param {Function} [props.onDuplicate] - Handler for duplicating this object
 * @param {Function} [props.onDelete] - Handler for deleting this object
 * @param {Function} [props.onFieldDuplicate] - Handler for duplicating fields inside this object
 * @param {Function} [props.onFieldDelete] - Handler for deleting fields inside this object
 * @param {boolean} [props.allowDuplication] - Whether this object can be duplicated
 * @param {boolean} [props.allowDeletion] - Whether this object can be deleted
 * @param {boolean} [props.initiallyCollapsed] - Whether to start collapsed (default: true)
 */
export const ObjectField = ({
  field,
  onDuplicate,
  onDelete,
  onFieldDuplicate,
  onFieldDelete,
  allowDuplication = true,
  allowDeletion = true,
  initiallyCollapsed = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);
  const [fields, setFields] = useState(field.fields || []);

  // Toggle collapse state when the collapse icon is clicked
  const handleCollapse = (e) => {
    // Stop event propagation to prevent bubble up
    if (e) e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  // Force open the container if it's closed - useful for operations that need to see the content
  const forceExpand = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      return true;
    }
    return false;
  }, [isCollapsed]);

  // Use _displayLabel for duplicated fields (with empty label but display text)
  // This allows the label to appear in the UI while still being editable
  const displayLabel = field._displayLabel || field.fields?.find(f => f.name === 'sectionDescription')?.value || field.label;
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

  /**
   * Handles duplication of fields inside this object
   */
  const handleFieldDuplicate = useCallback((fieldToDuplicate) => {
    // Make sure the object stays expanded during duplication
    forceExpand();

    // Generate a unique identifier for the duplicate
    const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Handle label for duplicate properly, adding (Copy) suffix
    let newLabel;
    if (fieldToDuplicate.label) {
      newLabel = `${fieldToDuplicate.label}${fieldToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
    }

    // Create duplicated field with unique ID (deep clone to avoid reference issues)
    const duplicatedField = {
      ...JSON.parse(JSON.stringify(fieldToDuplicate)),
      id: `${fieldToDuplicate.id}_${uniqueId}`,
      label: newLabel
    };

    setFields(currentFields => {
      const index = currentFields.findIndex(f => f.id === fieldToDuplicate.id);
      if (index !== -1) {
        const newFields = [...currentFields];
        newFields.splice(index + 1, 0, duplicatedField);
        return newFields;
      }
      return currentFields;
    });
  }, [isCollapsed]);

  /**
   * Handles deletion of fields inside this object
   */
  const handleFieldDelete = useCallback((fieldToDelete) => {
    // Make sure the object stays expanded during deletion
    forceExpand();

    setFields(currentFields => {
      // Find exact field to delete
      const fieldIndex = currentFields.findIndex(f => f.id === fieldToDelete.id);

      if (fieldIndex === -1) {
        console.error('Field to delete not found:', fieldToDelete.id);
        return currentFields;
      }

      // Create new array without the specific field
      const newFields = [
        ...currentFields.slice(0, fieldIndex),
        ...currentFields.slice(fieldIndex + 1)
      ];

      return newFields;
    });
  }, [forceExpand]);

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
          readOnly={!!field.label}
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
              name: `${field.name}[${fieldIndex}]${fieldItem.name ? `[${fieldItem.name}]` : ''}`,
              parentId: field.id // Add parent reference
            }}
            onFieldDuplicate={(fieldToDuplicate) => {
              // Use the index from the map to directly insert the duplicate after the correct field
              // This is more reliable than searching by ID which might not be unique
              const duplicateByIndex = () => {
                // Generate a unique identifier
                const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                // Handle label for duplicate
                let newLabel;
                if (fieldToDuplicate.label) {
                  newLabel = `${fieldToDuplicate.label}${fieldToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
                }

                // Create the duplicated field with unique ID
                // Get the original fieldToDuplicate without readonly flags
                const fieldCopy = JSON.parse(JSON.stringify(fieldToDuplicate));

                // Remove readonly from the fieldCopy
                if (fieldCopy.readOnly) delete fieldCopy.readOnly;

                // Set the label to empty string to make it editable
                // This is all we need since readOnly={!!label} checks if label exists
                const duplicatedField = {
                  ...fieldCopy,
                  id: `${fieldToDuplicate.id || field.id}_field_${fieldIndex}_${uniqueId}`,
                  label: '' // Empty label makes readOnly={!!label} evaluate to false
                };

                // Store the label suggestion in a custom property
                duplicatedField._displayLabel = newLabel;

                // Make sure the container stays expanded
                forceExpand();

                // Insert after the index position directly
                setFields(currentFields => {
                  if (fieldIndex >= 0 && fieldIndex < currentFields.length) {
                    const newFields = [...currentFields];
                    newFields.splice(fieldIndex + 1, 0, duplicatedField);
                    return newFields;
                  }
                  return currentFields;
                });
              };

              // Duplicate by index instead of searching by ID
              duplicateByIndex();

              // Return false to prevent the event from bubbling up
              return false;
            }}
            onFieldDelete={(fieldToDelete) => {
              // Use the index from the map to directly delete the correct field
              // This is more reliable than searching by ID which might not be unique
              const deleteByIndex = () => {
                setFields(currentFields => {
                  if (fieldIndex >= 0 && fieldIndex < currentFields.length) {
                    // Create a new array with the field at this specific index removed
                    return [
                      ...currentFields.slice(0, fieldIndex),
                      ...currentFields.slice(fieldIndex + 1)
                    ];
                  }
                  return currentFields;
                });
              };

              // Delete by index instead of searching by ID
              deleteByIndex();

              // Return false to prevent the event from bubbling up
              return false;
            }}
            parentType="object"
          />
        ))}
      </Dropzone>
      {/* Direct button implementation for better control */}
      <div className="button-wrapper">
        {allowDuplication && (
          <div
            className="add-button"
            title="Duplicate this object"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onDuplicate) onDuplicate();
            }}
          >
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div
            className="delete-button"
            title="Delete this object"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onDelete) onDelete();
            }}
          >
            <DeleteIcon />
          </div>
        )}
      </div>
      {/* Debug info
      <div style={{display: 'none'}}>
        Object debug ID: {debugId},
        Handlers: Duplicate={!!onDuplicate}, Delete={!!onDelete}
      </div>
      */}
      <input type="hidden" name={originalName} value={field.value} />
    </div>
  );
};
