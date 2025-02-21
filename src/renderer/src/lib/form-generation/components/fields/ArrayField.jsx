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
export const ArrayField = ({ field, onUpdate, index }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [collapsedFields, setCollapsedFields] = useState(new Set());

  /**
   * Toggles the collapsed state of the array container
   */
  const handleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Toggles the collapsed state of individual fields
   * @param {string} fieldPath - Unique identifier for the field
   */
  const handleFieldCollapse = useCallback((fieldPath) => {
    setCollapsedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldPath)) {
        newSet.delete(fieldPath);
      } else {
        newSet.add(fieldPath);
      }
      return newSet;
    });
  }, []);

  /**
   * Handles updates to nested fields within array items
   */
  const handleNestedUpdate = useCallback((arrayIndex, fieldId, newValue) => {
    const updatedValue = [...(field.value || [])];
    updatedValue[arrayIndex] = {
      ...updatedValue[arrayIndex],
      fields: updatedValue[arrayIndex].fields.map(f =>
        f.id === fieldId ? { ...f, ...newValue } : f
      )
    };
    onUpdate(field.id, updatedValue);
  }, [field, onUpdate]);

  /**
   * Handles drag and drop events for array items
   */
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        const fieldData = data.field || data;
        const currentValue = Array.isArray(field.value) ? field.value : [];
        const newItem = ensureFieldStructure({
          ...fieldData,
          id: `${field.id}_item_${currentValue.length}`
        }, field.id);

        onUpdate(field.id, {
          ...field,
          value: [...currentValue, newItem]
        });
        break;
      }

      case 'reorder': {
        const { sourceIndex, targetIndex } = position;
        if (field.value) {
          const newValue = [...field.value];
          const [movedItem] = newValue.splice(sourceIndex, 1);
          newValue.splice(targetIndex, 0, movedItem);
          onUpdate(field.id, { ...field, value: newValue });
        }
        break;
      }
    }
  }, [field, onUpdate]);

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
        {(field.value || []).map((item, index) => (
          <FormField
            key={item.id || index}
            field={ensureFieldStructure(processArrayItem(item, index), field.id)}
            onUpdate={(fieldId, newValue) => {
              const newValues = [...field.value];
              newValues[index] = ensureFieldStructure({ ...newValues[index], ...newValue }, field.id);
              onUpdate(field.id, { ...field, value: newValues });
            }}
            index={index}
          />
        ))}
      </Dropzone>
    </div>
  );
};

// Remove the default export if it exists
