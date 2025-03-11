import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import {
  DragHandleIcon,
  CollapsedIcon,
  CollapseIcon,
  AddIcon,
  DeleteIcon
} from '@components/icons';
import Dropzone from '@components/Dropzone';
import { ensureFieldStructure } from '../../utilities/field-structure';
import { StorageOperations } from '@utils/services/storage';
import { processFrontmatter } from '../../processors/frontmatter-processor';
import { toTitleCase } from '@utils/format/string';
import FieldControls from './FieldControls';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { useAsyncOperation } from '../../../../hooks/useAsyncOperation';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} ArrayFieldProps
 * @property {Object} field - The field configuration object
 * @property {string} field.id - Unique identifier for the field
 * @property {string} field.label - Display label for the field
 * @property {string} field.type - Field type (should be 'array')
 * @property {Array} [field.value] - Initial array values
 * @property {Function} [onDuplicate] - Handler for duplicating this array
 * @property {Function} [onDelete] - Handler for deleting this array
 * @property {Function} [onFieldDuplicate] - Handler for duplicating items inside this array
 * @property {Function} [onFieldDelete] - Handler for deleting items inside this array
 * @property {boolean} [allowDuplication] - Whether this array can be duplicated
 * @property {boolean} [allowDeletion] - Whether this array can be deleted
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-array.is-loading .array-dropzone {
  opacity: 0.6;
  pointer-events: none;
}

.form-element.is-array .loading-indicator {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  margin-bottom: 8px;
}

.form-element.is-array.has-error {
  border-left: 3px solid #e74c3c;
}

.form-element.is-array .field-error {
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
 * Renders an array field component that can contain multiple items of the same type.
 * Supports drag and drop reordering and nested field structures.
 *
 * @param {ArrayFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered array field component
 */
export const ArrayField = ({
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
  const [items, setItems] = useState(field.value || []);

  /**
   * Toggles the collapsed state of the array field
   */
  const handleCollapse = useCallback(
    (e) => {
      // Stop event propagation to prevent bubble up
      if (e) e.stopPropagation();
      setIsCollapsed((prev) => !prev);
    },
    [isCollapsed]
  );

  // Force open the container if it's closed - useful for operations that need to see the content
  const forceExpand = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      return true;
    }
    return false;
  }, [isCollapsed]);

  /**
   * Handles dropzone events for drag and drop operations
   * @param {Object} params - Event parameters
   * @param {string} params.type - Event type ('sidebar' or 'reorder')
   * @param {Object} params.data - Dropped data
   * @param {Object} params.position - Drop position information
   * @param {number} [params.position.sourceIndex] - Original position for reorder
   * @param {number} [params.position.targetIndex] - Target position for reorder
   */
  const { handleError } = useError();
  
  // Create an async operation for template loading
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

      return typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    },
    operationName: 'loadTemplate',
    onError: (error) => {
      logger.error('Failed to load template', error);
    }
  });
  
  const handleDropzoneEvent = useCallback(
    async ({ type, data, position }) => {
      if (!data) return;

      switch (type) {
        case 'template': {
          try {
            const rawTemplate = await loadTemplate(data.url);
            if (!rawTemplate) return;

            // Special handling for flex sections
            if (rawTemplate.columns) {
              setItems((currentItems) => {
                const newItems = [...currentItems];
                // Create a columns array field
                const columnsField = {
                  type: 'array',
                  label: 'columns',
                  id: `${field.id}_columns`,
                  value: rawTemplate.columns.map((column, colIndex) => ({
                    type: 'array',
                    label: `Column ${colIndex + 1}`,
                    id: `${field.id}_column_${colIndex}`,
                    name: 'column',
                    value: column.column || []
                  }))
                };
                newItems.push(columnsField);
                return newItems;
              });
            } else {
              // Default template processing
              const processedData = await processFrontmatter(
                rawTemplate.frontMatter || rawTemplate,
                rawTemplate.content || ''
              );

              setItems((currentItems) => {
                const newItems = [
                  ...currentItems,
                  {
                    type: 'object',
                    label: rawTemplate.sectionDescription || 'New Section',
                    id: `${field.id}_item_${currentItems.length}`,
                    name: field.name, // Preserve the original array name
                    fields: processedData.fields
                  }
                ];
                return newItems;
              });
            }
            
            logger.info('Template added to array field', { fieldId: field.id, template: data.url });
          } catch (error) {
            handleError(error, 'dropzoneTemplate');
          }
          break;
        }
        case 'sidebar': {
          try {
            const fieldData = data.field || data;

            const newItem = ensureFieldStructure(
              {
                ...fieldData,
                id: `${field.id}_item_${items.length}`
              },
              field.id
            );

            setItems((currentItems) => {
              const newItems = [...currentItems, newItem];
              return newItems;
            });
            
            logger.debug('Added new item from sidebar', { fieldId: field.id, itemType: fieldData.type });
          } catch (error) {
            handleError(error, 'dropzoneSidebar');
          }
          break;
        }
        case 'reorder': {
          try {
            const { sourceIndex, targetIndex } = position;
            setItems((currentItems) => {
              const newItems = [...currentItems];
              const [movedItem] = newItems.splice(sourceIndex, 1);
              newItems.splice(targetIndex, 0, movedItem);
              return newItems;
            });
            
            logger.debug('Reordered array items', { 
              fieldId: field.id, 
              sourceIndex, 
              targetIndex 
            });
          } catch (error) {
            handleError(error, 'dropzoneReorder');
          }
          break;
        }
      }
    },
    [field.id, field.name, items.length, loadTemplate, handleError]
  );

  /**
   * Sets up drag data when starting to drag the array field
   * @param {DragEvent} e - The drag event
   */
  const handleDragStart = useCallback(
    (e) => {
      e.dataTransfer.setData('origin', 'dropzone');
      e.dataTransfer.setData('application/json', JSON.stringify(field));
    },
    [field]
  );

  /**
   * Processes an array item to ensure it has the correct structure
   * @param {*} item - The item to process
   * @param {number} index - The index of the item in the array
   * @returns {Object} Processed item with correct structure
   */
  const processArrayItem = useCallback(
    (item, index) => {
      if (item.type) return item;

      if (typeof item === 'object' && item !== null) {
        // Check if this is a column object
        if (item.column || field.label === 'columns') {
          return {
            type: 'object',
            label: toTitleCase(`Column ${index + 1}`), // Transform label
            id: `${field.id}_column_${index + 1}`,
            fields: Object.entries(item).map(([key, value]) => ({
              type: typeof value === 'object' ? 'object' : 'text',
              label: toTitleCase(key), // Transform label
              id: `${field.id}_column_${index + 1}_${key}`,
              name: `${field.id}[${index}][${key}]`,
              defaultValue: value
            }))
          };
        }

        // Default object processing
        return {
          type: 'object',
          label: toTitleCase(`${field.label} ${index + 1}`), // Transform label
          id: `${field.id}_${index + 1}`,
          fields: Object.entries(item).map(([key, value]) => ({
            type: typeof value === 'object' ? 'object' : 'text',
            label: toTitleCase(key), // Transform label
            id: `${field.id}_${index + 1}_${key}`,
            name: `${field.id}[${index}][${key}]`,
            defaultValue: value
          }))
        };
      }

      return {
        type: 'text',
        label: toTitleCase(`${field.label} ${index + 1}`), // Transform label
        id: `${field.id}_${index + 1}`,
        name: `${field.id}[${index}]`,
        defaultValue: item
      };
    },
    [field.id, field.label]
  );

  /**
   * Access the FormOperationsContext for standardized operations
   */
  const { duplicateField, deleteField } = useFormOperations();
  
  /**
   * Handles duplication of items inside this array
   */
  const handleFieldDuplicate = useCallback(
    (itemToDuplicate) => {
      try {
        // Make sure the array stays expanded during duplication
        forceExpand();

        // Generate a unique identifier for the duplicate
        const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Handle label for duplicate properly, adding (Copy) suffix
        let newLabel;
        if (itemToDuplicate.label) {
          newLabel = `${itemToDuplicate.label}${itemToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
        }

        // Create duplicated item with unique ID (deep clone to avoid reference issues)
        const duplicatedItem = {
          ...JSON.parse(JSON.stringify(itemToDuplicate)),
          id: `${itemToDuplicate.id}_${uniqueId}`,
          label: newLabel
        };

        setItems((currentItems) => {
          const index = currentItems.findIndex((item) => item.id === itemToDuplicate.id);
          if (index !== -1) {
            const newItems = [...currentItems];
            newItems.splice(index + 1, 0, duplicatedItem);
            
            // Fire a custom event for duplication that the form operations context can listen for
            duplicateField(field.id, index);
            
            logger.debug('Duplicated array item', { 
              fieldId: field.id, 
              index, 
              itemId: itemToDuplicate.id 
            });
            
            return newItems;
          }
          return currentItems;
        });
      } catch (error) {
        handleError(error, 'handleFieldDuplicate');
      }
    },
    [field.id, forceExpand, duplicateField, handleError]
  );

  /**
   * Handles deletion of items inside this array
   */
  const handleFieldDelete = useCallback(
    (itemToDelete) => {
      try {
        // Make sure the array stays expanded during deletion
        forceExpand();

        setItems((currentItems) => {
          // Find exact item to delete
          const itemIndex = currentItems.findIndex((item) => item.id === itemToDelete.id);

          if (itemIndex === -1) {
            logger.warn('Item to delete not found', { itemId: itemToDelete.id });
            return currentItems;
          }

          // Create new array without the specific item
          const newItems = [
            ...currentItems.slice(0, itemIndex),
            ...currentItems.slice(itemIndex + 1)
          ];
          
          // Fire a custom event for deletion that the form operations context can listen for
          deleteField(field.id, itemIndex);
          
          logger.debug('Deleted array item', { 
            fieldId: field.id, 
            index: itemIndex, 
            itemId: itemToDelete.id 
          });
          
          return newItems;
        });
      } catch (error) {
        handleError(error, 'handleFieldDelete');
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
      className={`form-element is-array no-drop label-exists ${hasError ? 'has-error' : ''} ${templateLoading ? 'is-loading' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="array-name label-wrapper">
        <span>
          {field.label}
          {field.required && <sup>*</sup>}
        </span>
        <input
          type="text"
          className="element-label"
          name={`${field.id}_label`}
          placeholder="Array Name"
          defaultValue={field._displayLabel || field.label}
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
        className={`array-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-array"
        onDrop={handleDropzoneEvent}
      >
        {items.map((item, index) => (
          <FormField
            key={item.id || index}
            field={{
              ...ensureFieldStructure(processArrayItem(item, index), field.id),
              name: `${field.name}[${index}]`, // Use field.name instead of field.id
              parentId: field.id // Add parent reference
            }}
            onFieldDuplicate={(itemToDuplicate) => {
              try {
                // Use the index from the map to directly insert the duplicate after the correct item
                // Generate a unique identifier
                const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                // Handle label for duplicate
                let newLabel;
                if (itemToDuplicate.label) {
                  newLabel = `${itemToDuplicate.label}${itemToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
                }

                // Create the duplicated item with unique ID
                // Get the original itemToDuplicate without readonly flags
                const itemCopy = JSON.parse(JSON.stringify(itemToDuplicate));

                // Remove readonly from the itemCopy
                if (itemCopy.readOnly) delete itemCopy.readOnly;

                // Set the label to empty string to make it editable
                const duplicatedItem = {
                  ...itemCopy,
                  id: `${itemToDuplicate.id || field.id}_item_${index}_${uniqueId}`,
                  label: '' // Empty label makes readOnly={!!label} evaluate to false
                };

                // Store the label suggestion in a custom property
                duplicatedItem._displayLabel = newLabel;

                // Make sure the container stays expanded
                forceExpand();

                // Insert after the index position directly
                setItems((currentItems) => {
                  if (index >= 0 && index < currentItems.length) {
                    const newItems = [...currentItems];
                    newItems.splice(index + 1, 0, duplicatedItem);
                    
                    // Notify form operations context
                    duplicateField(`${field.name}[${index}]`, index);
                    
                    logger.debug('Duplicated nested item', { 
                      fieldId: field.id, 
                      index, 
                      itemId: itemToDuplicate.id 
                    });
                    
                    return newItems;
                  }
                  return currentItems;
                });
                
                // Return false to prevent the event from bubbling up
                return false;
              } catch (error) {
                handleError(error, 'duplicateArrayItem');
                return false;
              }
            }}
            onFieldDelete={(itemToDelete) => {
              try {
                // Use the index from the map to directly delete the correct item
                // This is more reliable than searching by ID which might not be unique
                setItems((currentItems) => {
                  if (index >= 0 && index < currentItems.length) {
                    // Create a new array with the item at this specific index removed
                    const newItems = [...currentItems.slice(0, index), ...currentItems.slice(index + 1)];
                    
                    // Notify form operations context
                    deleteField(`${field.name}[${index}]`, index);
                    
                    logger.debug('Deleted nested item', { 
                      fieldId: field.id, 
                      index,
                      itemId: itemToDelete.id 
                    });
                    
                    return newItems;
                  }
                  return currentItems;
                });
                
                // Return false to prevent the event from bubbling up
                return false;
              } catch (error) {
                handleError(error, 'deleteArrayItem');
                return false;
              }
            }}
            onFieldUpdate={(updatedField) => {
              if (onFieldUpdate) {
                try {
                  // Create a copy of the current items to update the specific field
                  setItems((currentItems) => {
                    const newItems = [...currentItems];
                    // Update the specific item at this index
                    newItems[index] = {
                      ...newItems[index],
                      ...updatedField
                    };

                    // Pass the entire updated field with all items to the parent handler
                    onFieldUpdate(
                      {
                        ...field,
                        items: newItems
                      },
                      [{ type: 'array', index, fieldIndex: index }]
                    );

                    return newItems;
                  });
                } catch (error) {
                  handleError(error, 'updateArrayItem');
                }
              }
            }}
            parentType="array"
          />
        ))}
      </Dropzone>
      
      {/* Field controls */}
      <div className="button-wrapper">
        {allowDuplication && (
          <div
            className="add-button"
            title="Duplicate this array"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              try {
                if (onDuplicate) onDuplicate();
              } catch (error) {
                handleError(error, 'duplicateArray');
              }
            }}
          >
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div
            className="delete-button"
            title="Delete this array"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              try {
                if (onDelete) onDelete();
              } catch (error) {
                handleError(error, 'deleteArray');
              }
            }}
          >
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};
