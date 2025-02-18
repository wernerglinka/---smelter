import { useState, useCallback } from 'react';
import { FormField } from '../FormField';
import { DragHandleIcon, CollapsedIcon, CollapseIcon } from '@components/icons';
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
    // Get the actual dropzone where the drop occurred
    const dropzone = position.target?.closest('.dropzone');
    if (!dropzone) return;

    console.log('ArrayField handleDropzoneEvent:', { type, data, position });
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        console.log('ArrayField sidebar case - incoming data:', data);
        const fieldData = data.field || data;
        const newValue = [...(field.value || [])];
        console.log('ArrayField current value:', newValue);

        // If dropping into an object dropzone within an array item
        if (dropzone.matches('.object-dropzone')) {
          const arrayItem = dropzone.closest('.form-element.is-object');
          if (!arrayItem) return;

          const arrayIndex = Array.from(arrayItem.parentNode.children)
            .filter(el => el.matches('.form-element.is-object'))
            .indexOf(arrayItem);

          console.log('ArrayField dropping into array item:', arrayIndex);
          const updatedFields = [...(newValue[arrayIndex].fields || [])];

          // Get insertion point
          const { closest, position: insertPosition } = getInsertionPoint(dropzone, position.y);
          if (closest) {
            const targetIndex = Array.from(dropzone.children)
              .filter(el => el.matches('.form-element'))
              .indexOf(closest);
            updatedFields.splice(targetIndex, 0, fieldData);
          } else {
            updatedFields.push(fieldData);
          }

          newValue[arrayIndex] = {
            ...newValue[arrayIndex],
            fields: updatedFields
          };
        }
        // If dropping directly into the array dropzone
        else if (dropzone.matches('.array-dropzone')) {
          console.log('ArrayField dropping new array item');
          const newItem = {
            id: `${field.id}_item_${newValue.length}`,
            name: `Item ${newValue.length + 1}`,
            fields: [fieldData]
          };
          console.log('ArrayField new item created:', newItem);

          // Get insertion point
          const { closest, position: insertPosition } = getInsertionPoint(dropzone, position.y);
          if (closest) {
            const targetIndex = Array.from(dropzone.children)
              .filter(el => el.matches('.form-element'))
              .indexOf(closest);
            newValue.splice(targetIndex, 0, newItem);
          } else {
            newValue.push(newItem);
          }
        }

        onUpdate(field.id, newValue);
        console.log('ArrayField after update:', field.id, newValue);
        break;
      }

      case 'reorder': {
        console.log('ArrayField reorder case:', position);
        if (field.value) {
          const newValue = [...field.value];
          const [movedItem] = newValue.splice(sourceIndex, 1);
          newValue.splice(targetIndex, 0, movedItem);
          onUpdate(field.id, newValue);
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
