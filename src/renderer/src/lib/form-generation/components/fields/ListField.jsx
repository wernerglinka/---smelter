import React, { useState } from 'react';
import { DragHandleIcon, AddIcon, DeleteIcon, CollapseIcon, CollapsedIcon } from '@components/icons';

/**
 * @typedef {Object} ListFieldProps
 * @property {Object} field - The field configuration object
 * @property {string} [field.label] - Display label for the field
 * @property {Array<string>} [field.value] - Initial list values
 * @property {boolean} [allowDuplication=true] - Whether items can be duplicated
 */

/**
 * ListField component that renders a collapsible list of text inputs.
 * Each item in the list can be duplicated and deleted (if there's more than one item).
 * The list always maintains at least one item.
 *
 * @param {ListFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered list field component
 */
export const ListField = ({ field = {}, allowDuplication = true }) => {
  // Track collapsed state of the list
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Initialize with at least one empty item if no values provided
  const [items, setItems] = useState(field.value || ['']);

  /**
   * Toggles the collapsed state of the list
   */
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  /**
   * Creates a copy of an existing item and inserts it after the source item
   * @param {number} index - Index of the item to duplicate
   */
  const handleAddItem = (index) => {
    const newItems = [...items];
    const itemToClone = newItems[index];
    newItems.splice(index + 1, 0, `Copy of ${itemToClone}`);
    setItems(newItems);
  };

  /**
   * Removes an item from the list if there's more than one item
   * @param {number} index - Index of the item to delete
   */
  const handleDeleteItem = (index) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
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
          defaultValue={field.label || ''}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>

      {/* List items container with collapse support */}
      <div className={`list-dropzone dropzone js-dropzone ${isCollapsed ? 'is-collapsed' : ''}`} data-wrapper="is-list">
        <ul>
          {items.map((item, index) => (
            <li key={`${index}-${item}`} className="list-item">
              <input
                type="text"
                defaultValue={item || ''}
              />
              {/* Item action buttons */}
              <div className="button-wrapper">
                {/* Duplicate button - shown if duplication is allowed */}
                {allowDuplication && (
                  <div className="add-button" title="Duplicate this list" onClick={() => handleAddItem(index)}>
                    <AddIcon />
                  </div>
                )}
                {/* Delete button - only shown when there's more than one item */}
                {items.length > 1 && (
                  <div
                    className="delete-button"
                    title="Delete this list"
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
    </div>
  );
};
