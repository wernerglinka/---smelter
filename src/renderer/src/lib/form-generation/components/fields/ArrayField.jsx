import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon, AddIcon, DeleteIcon } from '@components/icons';
import Dropzone from '@components/Dropzone';

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

        // If an object is placed in an array dropzone, hide the label input
        // since the object will not need a name
        if (fieldData.type === 'object') {
          // Generate a unique name for the object in array
          const objectsInArray = currentValue.length;
          const objectName = `neverMind${objectsInArray + 1}`;

          const newItem = {
            ...fieldData,
            id: `${field.id}_item_${currentValue.length}`,
            label: objectName,
            name: objectName,
            fields: []
          };

          const updatePayload = {
            ...field,
            value: [...currentValue, newItem]
          };

          onUpdate(field.id, updatePayload);
        } else {
          // For non-object fields
          const newItem = {
            id: `${field.id}_item_${currentValue.length}`,
            name: `Item ${currentValue.length + 1}`,
            fields: [{
              ...fieldData,
              id: `${field.id}_${fieldData.type}_${Date.now()}`,
              fields: fieldData.fields || []
            }]
          };

          const updatePayload = {
            ...field,
            value: [...currentValue, newItem]
          };

          onUpdate(field.id, updatePayload);
        }
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
    <div className="form-element is-array" draggable="true" onDragStart={handleDragStart}>
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
        {(field.value || []).map((item, arrayIndex) => {
          const itemPath = `${field.id}_item_${arrayIndex}`;
          const isItemCollapsed = collapsedFields.has(itemPath);

          return (
            <div key={arrayIndex} className="form-element is-object label-exists no-drop" draggable="true">
              <span className="sort-handle">
                <DragHandleIcon />
              </span>
              <label className="object-name label-wrapper label-exists">
                <span>{item.name || `Item ${arrayIndex + 1}`}</span>
                <input
                  type="text"
                  className="element-label"
                  defaultValue={item.name || `Item ${arrayIndex + 1}`}
                  readOnly
                />
                <span className="collapse-icon" onClick={() => handleFieldCollapse(itemPath)}>
                  {isItemCollapsed ? <CollapsedIcon /> : <CollapseIcon />}
                </span>
              </label>
              <Dropzone
                className={`object-dropzone dropzone js-dropzone ${isItemCollapsed ? 'is-collapsed' : ''}`}
                data-wrapper="is-object"
                onDrop={(event) => handleDropzoneEvent({
                  ...event,
                  position: { ...event.position, arrayIndex }
                })}
              >
                {item.fields?.map((fieldItem, fieldIndex) => (
                  <FormField
                    key={`${fieldItem.id || fieldItem.name}-${fieldIndex}`}
                    field={fieldItem}
                    onUpdate={(fieldId, newValue) => handleNestedUpdate(arrayIndex, fieldId, newValue)}
                    draggable
                    index={fieldIndex}
                  />
                ))}
              </Dropzone>
            </div>
          );
        })}
      </Dropzone>
    </div>
  );
};

// Remove the default export if it exists
