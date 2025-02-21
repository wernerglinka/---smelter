import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon, AddIcon, DeleteIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';
import { ensureFieldStructure } from '../../utilities/field-structure';

export const ArrayField = ({ field, onUpdate, index }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [collapsedFields, setCollapsedFields] = useState(new Set());

  const handleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleFieldCollapse = (fieldPath) => {
    setCollapsedFields(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldPath)) {
        newSet.delete(fieldPath);
      } else {
        newSet.add(fieldPath);
      }
      return newSet;
    });
  };

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

        const updatePayload = {
          ...field,
          value: [...currentValue, newItem]
        };

        onUpdate(field.id, updatePayload);
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

  const handleDragStart = useCallback((e) => {
    console.log('ArrayField handleDragStart:', field);
    e.dataTransfer.setData('origin', 'dropzone');
    e.dataTransfer.setData('application/json', JSON.stringify(field));
  }, [field]);

  // Helper function from example.js
  const getInsertionPoint = (container, clientY) => {
    const children = Array.from(container.children)
      .filter(el => el.matches('.form-element'));

    if (!children.length) return { closest: null, position: 'empty' };

    let closestElement = null;
    let closestDistance = Infinity;
    let position = 'after';

    children.forEach(child => {
      const rect = child.getBoundingClientRect();
      const childMiddle = rect.top + rect.height / 2;
      const distance = Math.abs(clientY - childMiddle);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = child;
        position = clientY < childMiddle ? 'before' : 'after';
      }
    });

    return { closest: closestElement, position };
  };

  return (
    <div className={`form-element is-array no-drop label-exists`} draggable="true" onDragStart={handleDragStart}>
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
        {(field.value || []).map((item, index) => {
          // If it's already a field structure or a primitive value, don't wrap it
          const itemField = item.type ? item :
            (typeof item === 'object' && item !== null) ? {
              type: 'object',
              label: `Item ${index + 1}`,
              id: `${field.id}_item_${index}`,
              fields: Object.entries(item).map(([key, value]) => ({
                type: typeof value === 'object' ? 'object' : 'text',
                label: key,
                id: `${field.id}_item_${index}_${key}`,
                value: value
              }))
            } : {
              type: 'text',
              label: `Item ${index + 1}`,
              id: `${field.id}_item_${index}`,
              value: item
            };

          return (
            <FormField
              key={itemField.id || index}
              field={ensureFieldStructure(itemField, field.id)}
              onUpdate={(fieldId, newValue) => {
                const newValues = [...field.value];
                newValues[index] = ensureFieldStructure({ ...newValues[index], ...newValue }, field.id);
                onUpdate(field.id, { ...field, value: newValues });
              }}
              index={index}
            />
          );
        })}
      </Dropzone>
    </div>
  );
};

// Remove the default export if it exists
