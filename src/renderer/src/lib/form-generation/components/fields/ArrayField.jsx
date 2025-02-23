import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';
import { ensureFieldStructure } from '../../utilities/field-structure';

/**
 * Renders an array field that can contain multiple items of the same type
 * Supports drag and drop reordering and nested field structures
 *
 * @param {Object} props - Component props
 * @param {Object} props.field - Field configuration object
 * @param {Function} props.onUpdate - Callback for field updates
 * @param {number} props.index - Field index in parent array
 */
export const ArrayField = ({ field }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [items, setItems] = useState(field.value || []);

  /**
   * Toggles the collapsed state of the array container
   */
  const handleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Handles drag and drop events for array items
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
   * Handles drag start event for the array container
   */
  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('origin', 'dropzone');
    e.dataTransfer.setData('application/json', JSON.stringify(field));
  }, [field]);

  /**
   * Processes an array item for rendering
   * @param {any} item - Array item to process
   * @param {number} index - Item index
   * @returns {Object} Processed field configuration
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
          value: value
        }))
      };
    }

    return {
      type: 'text',
      label: `Item ${index + 1}`,
      id: `${field.id}_item_${index}`,
      value: item
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
            field={ensureFieldStructure(processArrayItem(item, index), field.id)}
            index={index}
          />
        ))}
      </Dropzone>
    </div>
  );
};

// Remove the default export if it exists
