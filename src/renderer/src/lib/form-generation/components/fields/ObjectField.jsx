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
import { StorageOperations } from '@utils/services/storage';
import { processFrontmatter } from '../../processors/frontmatter-processor';
import FieldControls from './FieldControls';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { useAsyncOperation } from '../../../../hooks/useAsyncOperation';
import { logger } from '@utils/services/logger';

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-object.is-loading .object-dropzone {
  opacity: 0.6;
  pointer-events: none;
}

.form-element.is-object .loading-indicator {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 8px;
}

.form-element.is-object.has-error {
  border-left: 3px solid #e74c3c;
}

.form-element.is-object .field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

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
  onFieldUpdate,
  allowDuplication = true,
  allowDeletion = true,
  initiallyCollapsed = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);
  const [fields, setFields] = useState(field.fields || []);
  
  // Sync fields when field.fields changes
  React.useEffect(() => {
    setFields(field.fields || []);
  }, [field.fields]);

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
  const displayLabel =
    field._displayLabel ||
    field.fields?.find((f) => f.name === 'sectionDescription')?.value ||
    field.label;
  const originalName = field.name; // Store the original field name

  /**
   * Access error handling and form operations from context
   */
  const { handleError } = useError();
  
  /**
   * Create an async operation for template loading
   */
  const { loading: templateLoading, execute: loadTemplate } = useAsyncOperation({
    operation: async (templateUrl) => {
      const projectPath = await StorageOperations.getProjectPath();
      if (!projectPath) {
        throw new Error('Project path not found');
      }

      const cleanTemplateUrl = templateUrl.replace(/^\/+|\/+$/g, '');
      const templatePath = `${projectPath}/.metallurgy/frontMatterTemplates/templates/${cleanTemplateUrl}`;

      const result = await window.electronAPI.files.read(templatePath);
      if (result.status === 'failure') {
        throw new Error(`Failed to read template: ${result.error}`);
      }

      const templateData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      const schema = await processFrontmatter(templateData, '');
      
      return schema;
    },
    operationName: 'loadObjectTemplate',
    onError: (error) => {
      logger.error('Failed to load template for object field', error);
    }
  });
  
  /**
   * Handles drag and drop events for object fields
   */
  const handleDropzoneEvent = useCallback(
    async ({ type, data, position }) => {
      if (!data) return;

      switch (type) {
        case 'template': {
          try {
            const schema = await loadTemplate(data.url);
            if (!schema) return;
            
            setFields((currentFields) => [
              ...currentFields,
              {
                ...schema,
                id: `${field.id}_field_${currentFields.length}`
              }
            ]);
            
            logger.info('Template added to object field', { 
              fieldId: field.id, 
              template: data.url 
            });
          } catch (error) {
            handleError(error, 'objectDropzoneTemplate');
          }
          break;
        }
        case 'sidebar': {
          try {
            const fieldData = data.field || data;
            setFields((currentFields) => [
              ...currentFields,
              {
                ...fieldData,
                id: `${field.id}_field_${currentFields.length}`
              }
            ]);
            
            logger.debug('Added new field from sidebar', { 
              fieldId: field.id, 
              fieldType: fieldData.type 
            });
          } catch (error) {
            handleError(error, 'objectDropzoneSidebar');
          }
          break;
        }
        case 'reorder': {
          try {
            const { sourceIndex, targetIndex } = position;
            setFields((currentFields) => {
              const newFields = [...currentFields];
              const [movedField] = newFields.splice(sourceIndex, 1);
              newFields.splice(targetIndex, 0, movedField);
              
              logger.debug('Reordered object fields', { 
                fieldId: field.id, 
                sourceIndex, 
                targetIndex 
              });
              
              return newFields;
            });
          } catch (error) {
            handleError(error, 'objectDropzoneReorder');
          }
          break;
        }
      }
    },
    [field.id, loadTemplate, handleError]
  );

  /**
   * Handles drag start event for the object container
   */
  const handleDragStart = useCallback(
    (e) => {
      e.dataTransfer.setData('origin', 'dropzone');
      e.dataTransfer.setData('application/json', JSON.stringify(field));
    },
    [field]
  );

  /**
   * Access FormOperationsContext for standardized operations
   */
  const { duplicateField, deleteField } = useFormOperations();
  
  /**
   * Handles duplication of fields inside this object
   */
  const handleFieldDuplicate = useCallback(
    (fieldToDuplicate) => {
      try {
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

        setFields((currentFields) => {
          const index = currentFields.findIndex((f) => f.id === fieldToDuplicate.id);
          if (index !== -1) {
            const newFields = [...currentFields];
            newFields.splice(index + 1, 0, duplicatedField);
            
            // Notify form operations context
            duplicateField(field.id, index);
            
            logger.debug('Duplicated object field', { 
              fieldId: field.id, 
              index, 
              fieldId: fieldToDuplicate.id 
            });
            
            return newFields;
          }
          return currentFields;
        });
      } catch (error) {
        handleError(error, 'handleObjectFieldDuplicate');
      }
    },
    [field.id, forceExpand, duplicateField, handleError]
  );

  /**
   * Handles deletion of fields inside this object
   */
  const handleFieldDelete = useCallback(
    (fieldToDelete) => {
      try {
        // Make sure the object stays expanded during deletion
        forceExpand();

        setFields((currentFields) => {
          // Find exact field to delete
          const fieldIndex = currentFields.findIndex((f) => f.id === fieldToDelete.id);

          if (fieldIndex === -1) {
            logger.warn('Field to delete not found', { fieldId: fieldToDelete.id });
            return currentFields;
          }

          // Create new array without the specific field
          const newFields = [
            ...currentFields.slice(0, fieldIndex),
            ...currentFields.slice(fieldIndex + 1)
          ];
          
          // Notify form operations context
          deleteField(field.id, fieldIndex);
          
          logger.debug('Deleted object field', { 
            fieldId: field.id, 
            index: fieldIndex, 
            fieldId: fieldToDelete.id 
          });

          return newFields;
        });
      } catch (error) {
        handleError(error, 'handleObjectFieldDelete');
      }
    },
    [field.id, forceExpand, deleteField, handleError]
  );

  // Access validation errors from form operations context
  const { validationErrors } = useFormOperations();
  
  // Check if this field has validation errors
  const hasError = validationErrors && validationErrors[field.id];
  
  return (
    <div
      className={`form-element is-object no-drop label-exists ${hasError ? 'has-error' : ''} ${templateLoading ? 'is-loading' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper label-exists">
        <span>
          {field.label}
          {field.required && <sup>*</sup>}
        </span>
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
      
      {templateLoading && (
        <div className="loading-indicator">Loading template...</div>
      )}
      
      {hasError && (
        <div className="field-error">
          {validationErrors[field.id]}
        </div>
      )}
      
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
              try {
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
                setFields((currentFields) => {
                  if (fieldIndex >= 0 && fieldIndex < currentFields.length) {
                    const newFields = [...currentFields];
                    newFields.splice(fieldIndex + 1, 0, duplicatedField);
                    
                    // Notify form operations context
                    duplicateField(`${field.name}[${fieldIndex}]`, fieldIndex);
                    
                    logger.debug('Duplicated nested field', { 
                      parentId: field.id, 
                      index: fieldIndex, 
                      fieldId: fieldToDuplicate.id 
                    });
                    
                    return newFields;
                  }
                  return currentFields;
                });
                
                // Return false to prevent the event from bubbling up
                return false;
              } catch (error) {
                handleError(error, 'duplicateNestedField');
                return false;
              }
            }}
            onFieldDelete={(fieldToDelete) => {
              try {
                // Delete field by index instead of searching by ID
                setFields((currentFields) => {
                  if (fieldIndex >= 0 && fieldIndex < currentFields.length) {
                    // Create a new array with the field at this specific index removed
                    const newFields = [
                      ...currentFields.slice(0, fieldIndex),
                      ...currentFields.slice(fieldIndex + 1)
                    ];
                    
                    // Notify form operations context
                    deleteField(`${field.name}[${fieldIndex}]`, fieldIndex);
                    
                    logger.debug('Deleted nested field', { 
                      parentId: field.id, 
                      index: fieldIndex,
                      fieldId: fieldToDelete.id 
                    });
                    
                    return newFields;
                  }
                  return currentFields;
                });
                
                // Return false to prevent the event from bubbling up
                return false;
              } catch (error) {
                handleError(error, 'deleteNestedField');
                return false;
              }
            }}
            onFieldUpdate={(updatedField) => {
              if (onFieldUpdate) {
                try {
                  // Create a new array with the updated field
                  const newFields = [...fields];
                  newFields[fieldIndex] = {
                    ...newFields[fieldIndex],
                    ...updatedField
                  };
                  
                  // First notify the parent handler
                  onFieldUpdate(
                    {
                      ...field,
                      fields: newFields
                    },
                    [{ type: 'object', index: fieldIndex, fieldIndex }]
                  );
                  
                  // Then update local state in a separate render cycle
                  setTimeout(() => {
                    setFields(newFields);
                  }, 0);
                } catch (error) {
                  handleError(error, 'updateNestedField');
                }
              }
            }}
            parentType="object"
          />
        ))}
      </Dropzone>
      
      {/* Field controls */}
      <div className="button-wrapper">
        {allowDuplication && (
          <div
            className="add-button"
            title="Duplicate this object"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              try {
                if (onDuplicate) onDuplicate();
              } catch (error) {
                handleError(error, 'duplicateObject');
              }
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
              try {
                if (onDelete) onDelete();
              } catch (error) {
                handleError(error, 'deleteObject');
              }
            }}
          >
            <DeleteIcon />
          </div>
        )}
      </div>
      
      <input type="hidden" name={originalName} value={field.value} />
    </div>
  );
};
