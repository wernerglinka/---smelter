import React, { useState } from 'react';
import {
  DragHandleIcon,
  AddIcon,
  DeleteIcon,
  CollapseIcon,
  CollapsedIcon
} from '@components/icons';
import FieldControls from './FieldControls';

/**
 * @typedef {Object} ListFieldProps
 * @property {Object} field - The field configuration object
 * @property {string} [field.label] - Display label for the field
 * @property {Array<string>} [field.value] - Initial list values
 * @property {boolean} [allowDuplication=true] - Whether the list itself can be duplicated
 * @property {boolean} [allowDeletion=true] - Whether the list itself can be deleted
 * @property {Function} [onDuplicate] - Handler for duplicating this list field
 * @property {Function} [onDelete] - Handler for deleting this list field
 */

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
  allowDuplication = true,
  allowDeletion = true
}) => {
  // Track collapsed state of the list
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Initialize with at least one empty item if no values provided
  const [items, setItems] = useState(field.value || ['']);

  /**
   * Toggles the collapsed state of the list
   */
  const handleCollapse = (e) => {
    // Stop event propagation to prevent bubble up
    if (e) e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  /**
   * Creates a copy of an existing item and inserts it after the source item
   * @param {number} index - Index of the item to duplicate
   */
  const handleAddItem = (index) => {
    // Make sure the list stays expanded during duplication
    if (isCollapsed) {
      setIsCollapsed(false);
    }

    console.log('List: Duplicating item at index', index);

    const newItems = [...items];
    const itemToClone = newItems[index];

    // Generate the new item label with proper copy suffix
    let newItemText = itemToClone;
    if (typeof itemToClone === 'string') {
      if (itemToClone.includes('Copy of')) {
        newItemText = `Copy of ${itemToClone}`;
      } else {
        newItemText = `Copy of ${itemToClone}`;
      }
    }

    newItems.splice(index + 1, 0, newItemText);
    setItems(newItems);
  };

  /**
   * Removes an item from the list if there's more than one item
   * @param {number} index - Index of the item to delete
   */
  const handleDeleteItem = (index) => {
    // Make sure the list stays expanded during deletion
    if (isCollapsed) {
      setIsCollapsed(false);
    }

    console.log('List: Deleting item at index', index);

    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    } else {
      console.warn('Cannot delete the last item in a list');
    }
  };

  return (
    <div className="form-element is-list label-exists no-drop" draggable="true">
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
          readOnly={!!field.label}
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>

      {/* List items container with collapse support */}
      <div
        className={`list-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`}
        data-wrapper="is-list"
      >
        <ul>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="list-item">
              <input type="text" defaultValue={item || ''} />
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
