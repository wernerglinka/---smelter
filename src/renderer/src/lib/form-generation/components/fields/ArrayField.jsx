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
import { StorageOperations } from '@services/storage';
import { processFrontmatter } from '../../processors/frontmatter-processor';
import { toTitleCase } from '../../../utilities/formatting/to-title-case';

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
export const ArrayField = ({ field, allowDuplication = true, allowDeletion = true }) => {
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
      case 'template': {
        try {
          const projectPath = await StorageOperations.getProjectPath();
          if (!projectPath) {
            throw new Error('Project path not found');
          }

          const templateUrl = data.url.replace(/^\/+|\/+$/g, '');
          const templatePath = `${projectPath}/.metallurgy/frontMatterTemplates/templates/${templateUrl}`;

          const result = await window.electronAPI.files.read(templatePath);

          if (result.status === 'failure') {
            throw new Error(`Failed to read template: ${result.error}`);
          }

          const rawTemplate = typeof result.data === 'string' ?
            JSON.parse(result.data) : result.data;

          // Special handling for flex sections
          if (rawTemplate.columns) {
            setItems(currentItems => {
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

            setItems(currentItems => {
              const newItems = [...currentItems, {
                type: 'object',
                label: rawTemplate.sectionDescription || 'New Section',
                id: `${field.id}_item_${currentItems.length}`,
                fields: processedData.fields
              }];
              return newItems;
            });
          }
        } catch (error) {
          console.error('Error processing template in array:', error);
        }
        break;
      }
      case 'sidebar': {
        const fieldData = data.field || data;

        const newItem = ensureFieldStructure({
          ...fieldData,
          id: `${field.id}_item_${items.length}`
        }, field.id);

        setItems(currentItems => {
          const newItems = [...currentItems, newItem];
          return newItems;
        });
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
      // Check if this is a column object
      if (item.column || field.label === 'columns') {
        return {
          type: 'object',
          label: toTitleCase(`Column ${index + 1}`),  // Transform label
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
  }, [field.id, field.label]);

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
        onDrop={(event) => {
          handleDropzoneEvent(event);
        }}
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
      <div className="button-wrapper">
        {allowDuplication && (
          <div className="add-button button">
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div className="delete-button">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};

// Remove the default export if it exists
