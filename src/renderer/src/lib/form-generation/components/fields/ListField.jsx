import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DragHandleIcon,
  AddIcon,
  DeleteIcon,
  CollapseIcon,
  CollapsedIcon
} from '@components/icons';
import FieldControls from './FieldControls';
import { useFormOperations } from '../../../../context/FormOperationsContext';
import { useError } from '../../../../context/ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} ListFieldProps
 * @property {Object} field - The field configuration object
 * @property {string} field.id - Unique identifier for the field
 * @property {string} field.name - Input field name
 * @property {string} [field.label] - Display label for the field
 * @property {Array<string>} [field.value] - Initial list values
 * @property {boolean} [allowDuplication=true] - Whether the list itself can be duplicated
 * @property {boolean} [allowDeletion=true] - Whether the list itself can be deleted
 * @property {Function} [onDuplicate] - Handler for duplicating this list field
 * @property {Function} [onDelete] - Handler for deleting this list field
 * @property {Function} [onUpdate] - Handler for updating field value
 */

/**
 * Styles for loading and error states
 */
const styles = `
.form-element.is-list.has-error {
  border-left: 3px solid #e74c3c;
}

.form-element.is-list .field-error {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  margin-bottom: 8px;
  padding: 4px 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
}

.list-item.has-error input {
  border-color: #e74c3c;
  background-color: rgba(231, 76, 60, 0.05);
}
`;

// Add styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

/**
 * ListField component that renders a collapsible list of text inputs.
 * Each item in the list can be duplicated and deleted (if there's more than one item).
 * The list always maintains at least one item.
 *
 * @param {ListFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered list field component
 */
export const ListField = ({
  field = {},
  onDuplicate,
  onDelete,
  onUpdate,
  allowDuplication = !field?.noDuplication,
  allowDeletion = !field?.noDeletion
}) => {
  // Track collapsed state of the list
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Initialize with at least one empty item if no values provided
  const [items, setItems] = useState(field.value || ['']);
  
  // Access form operations context and error context
  const { setValue, validateField, validationErrors } = useFormOperations();
  const { handleError } = useError();
  
  // Check if this field has validation errors
  const hasError = validationErrors && validationErrors[field.id || field.name];

  // Track if this is the initial render
  const isInitialRender = React.useRef(true);
  
  // Track last item value to avoid unnecessary updates
  const lastItemsRef = useRef(null);
  
  // When items change, update the form value
  useEffect(() => {
    try {
      // Skip effect on initial render to prevent loops with existing data
      if (isInitialRender.current) {
        isInitialRender.current = false;
        lastItemsRef.current = JSON.stringify(items);
        return;
      }

      // Only update if field has a name and items actually changed
      if (field.name) {
        const currentItemsJson = JSON.stringify(items);
        
        // Skip update if there's no real change
        if (lastItemsRef.current === currentItemsJson) {
          return;
        }
        
        // Update the last items ref
        lastItemsRef.current = currentItemsJson;
        
        // Update form value
        setValue(field.name, items);
        
        // Call the original onUpdate handler if provided, with a small delay
        if (onUpdate) {
          // Wait until next frame to avoid update loops
          setTimeout(() => {
            onUpdate({
              id: field.id || field.name,
              name: field.name,
              type: field.type?.toLowerCase(),
              value: items
            });
          }, 0);
        }
      }
    } catch (error) {
      handleError(error, 'listFieldEffect');
    }
  }, [items, field, setValue, onUpdate, handleError]);

  /**
   * Toggles the collapsed state of the list
   */
  const handleCollapse = useCallback((e) => {
    try {
      // Stop event propagation to prevent bubble up
      if (e) e.stopPropagation();
      setIsCollapsed(prev => !prev);
    } catch (error) {
      handleError(error, 'handleCollapse');
    }
  }, [handleError]);

  /**
   * Creates a copy of an existing item and inserts it after the source item
   * @param {number} index - Index of the item to duplicate
   */
  const handleAddItem = useCallback((index) => {
    try {
      // Make sure the list stays expanded during duplication
      if (isCollapsed) {
        setIsCollapsed(false);
      }

      const newItems = [...items];
      const itemToClone = newItems[index];

      // Generate the new item label with proper copy suffix
      let newItemText = itemToClone;
      if (typeof itemToClone === 'string') {
        newItemText = itemToClone.includes('Copy of') ? `Copy of ${itemToClone}` : `Copy of ${itemToClone}`;
      }

      newItems.splice(index + 1, 0, newItemText);
      setItems(newItems);
      
      logger.debug('List item duplicated', { 
        fieldId: field.id || field.name,
        index,
        itemCount: newItems.length
      });
    } catch (error) {
      handleError(error, 'handleAddItem');
    }
  }, [isCollapsed, items, field, handleError]);

  /**
   * Removes an item from the list if there's more than one item
   * @param {number} index - Index of the item to delete
   */
  const handleDeleteItem = useCallback((index) => {
    try {
      // Make sure the list stays expanded during deletion
      if (isCollapsed) {
        setIsCollapsed(false);
      }

      if (items.length > 1) {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        
        logger.debug('List item deleted', { 
          fieldId: field.id || field.name,
          index,
          itemCount: newItems.length
        });
      } else {
        logger.warn('Cannot delete the last item in a list', {
          fieldId: field.id || field.name
        });
      }
    } catch (error) {
      handleError(error, 'handleDeleteItem');
    }
  }, [isCollapsed, items, field, handleError]);
  
  /**
   * Handles item text changes
   * @param {number} index - Index of the item being changed
   * @param {Event} e - Change event
   */
  const handleItemChange = useCallback((index, e) => {
    try {
      const newValue = e.target.value;
      const newItems = [...items];
      
      // Update the specific item
      newItems[index] = newValue;
      setItems(newItems);
      
      // Validate if needed
      if (field.required && newItems.some(item => !item)) {
        validateField(field.name, (value) => 
          value.every(item => item) ? true : 'All list items must have a value'
        );
      }
      
      logger.debug('List item updated', { 
        fieldId: field.id || field.name,
        index,
        value: newValue
      });
    } catch (error) {
      handleError(error, 'handleItemChange');
    }
  }, [items, field, validateField, handleError]);
  
  // Handle label changes on blur when editable
  const handleLabelBlur = useCallback((e) => {
    try {
      const newLabel = e.target.value;
      
      if (field._displayLabel !== undefined && newLabel !== field._displayLabel) {
        // Call the original onUpdate handler if provided
        if (onUpdate) {
          onUpdate({
            id: field.id || field.name,
            name: field.name,
            type: field.type?.toLowerCase(),
            _displayLabel: newLabel
          });
        }
        
        logger.debug('List field label updated', {
          fieldId: field.id || field.name,
          name: field.name,
          label: newLabel
        });
      }
    } catch (error) {
      handleError(error, 'handleLabelBlur');
    }
  }, [field, onUpdate, handleError]);

  return (
    <div 
      className={`form-element is-list label-exists no-drop ${hasError ? 'has-error' : ''}`} 
      draggable="true"
    >
      {/* Drag handle for reordering the entire list field */}
      <span className="sort-handle">
        <DragHandleIcon />
      </span>

      {/* Field label with collapse functionality */}
      <label className="label-wrapper object-name">
        <span>{field.label || ''}</span>
        <input
          type="text"
          className="element-label"
          placeholder="Label Placeholder"
          defaultValue={field._displayLabel || field.label || ''}
          readOnly={!field._displayLabel && !!field.label}
          onBlur={handleLabelBlur}
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>

      {hasError && (
        <div className="field-error">
          {validationErrors[field.id || field.name]}
        </div>
      )}

      {/* List items container with collapse support */}
      <div
        className={`list-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-list"
      >
        <ul>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="list-item">
              <input 
                type="text" 
                name={`${field.name}[${index}]`}
                defaultValue={item || ''} 
                onChange={(e) => handleItemChange(index, e)}
              />
              {/* Item action buttons */}
              <div className="button-wrapper">
                <div
                  className="add-button"
                  title="Duplicate this item"
                  onClick={() => handleAddItem(index)}
                >
                  <AddIcon />
                </div>
                {items.length > 1 && (
                  <div
                    className="delete-button"
                    title="Delete this item"
                    onClick={() => handleDeleteItem(index)}
                  >
                    <DeleteIcon />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Controls for the entire list field */}
      <FieldControls
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        allowDuplication={allowDuplication}
        allowDeletion={allowDeletion}
      />
    </div>
  );
};
