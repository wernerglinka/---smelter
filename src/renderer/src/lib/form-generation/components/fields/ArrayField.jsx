import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';
import { ensureFieldStructure } from '../../utilities/field-structure';

/**
 * @typedef {Object} ArrayFieldProps
 * @property {Object} field - The field configuration object
 * @property {string} field.id - Unique identifier for the field
 * @property {string} field.label - Display label for the field
 * @property {string} field.type - Field type (should be 'array')
 * @property {Array} [field.value] - Initial array values
 */

/**
 * Renders an array field component that can contain multiple items of the same type.
 * Supports drag and drop reordering and nested field structures.
 *
 * @param {ArrayFieldProps} props - Component properties
 * @returns {JSX.Element} Rendered array field component
 */
export const ArrayField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [items, setItems] = useState(field.value || []);

  /**
   * Toggles the collapsed state of the array field
   */
  const handleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Handles dropzone events for drag and drop operations
   * @param {Object} params - Event parameters
   * @param {string} params.type - Event type ('sidebar' or 'reorder')
   * @param {Object} params.data - Dropped data
   * @param {Object} params.position - Drop position information
   * @param {number} [params.position.sourceIndex] - Original position for reorder
   * @param {number} [params.position.targetIndex] - Target position for reorder
   */
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        const fieldData = data.field || data;
        const newItem = ensureFieldStructure({
          ...fieldData,
          id: `${field.id}_item_${items.length}`
        }, field.id);

        setItems(currentItems => [...currentItems, newItem]);
        break;
      }

      case 'reorder': {
        const { sourceIndex, targetIndex } = position;
        setItems(currentItems => {
          const newItems = [...currentItems];
          const [movedItem] = newItems.splice(sourceIndex, 1);
          newItems.splice(targetIndex, 0, movedItem);
          return newItems;
        });
        break;
      }
    }
  }, [field.id, items.length]);

  /**
   * Sets up drag data when starting to drag the array field
   * @param {DragEvent} e - The drag event
   */
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('origin', 'dropzone');
    e.dataTransfer.setData('application/json', JSON.stringify(field));
  }, [field]);

  /**
   * Processes an array item to ensure it has the correct structure
   * @param {*} item - The item to process
   * @param {number} index - The index of the item in the array
   * @returns {Object} Processed item with correct structure
   */
  const processArrayItem = useCallback((item, index) => {
    if (item.type) return item;

    if (typeof item === 'object' && item !== null) {
      return {
        type: 'object',
        label: `Item ${index + 1}`,
        id: `${field.id}_item_${index}`,
        fields: Object.entries(item).map(([key, value]) => ({
          type: typeof value === 'object' ? 'object' : 'text',
          label: key,
          id: `${field.id}_item_${index}_${key}`,
          name: `${field.id}[${index}][${key}]`,
          defaultValue: value
        }))
      };
    }

    return {
      type: 'text',
      label: `Item ${index + 1}`,
      id: `${field.id}_item_${index}`,
      name: `${field.id}[${index}]`,
      defaultValue: item
    };
  }, [field.id]);

  return (
    <div className="form-element is-array no-drop label-exists" draggable="true" onDragStart={handleDragStart}>
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="array-name label-wrapper">
        <span>{field.label}<sup>*</sup></span>
        <input
          type="text"
          className="element-label"
          name={`${field.id}_label`}
          placeholder="Array Name"
          defaultValue={field.label}
          readOnly
        />
        <span className="collapse-icon" onClick={handleCollapse}>
          {isCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
        </span>
      </label>
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
              name: `${field.id}[${index}]`
            }}
          />
        ))}
      </Dropzone>
    </div>
  );
};

// Remove the default export if it exists
