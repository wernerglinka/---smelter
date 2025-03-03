import React from 'react';
import {
  DragHandleIcon,
  AddIcon,
  DeleteIcon
} from '@components/icons';

/**
 * @typedef {Object} BaseFieldProps
 * @property {React.ReactNode} children - Field content components
 * @property {Object} field - Field configuration object
 * @property {string} field.name - Field identifier
 * @property {string} field.type - Field type
 * @property {string} [field.label] - Display label
 * @property {any} [field.value] - Field value
 * @property {boolean} [field.noDuplication] - Whether duplication is disabled
 * @property {boolean} [field.noDeletion] - Whether deletion is disabled
 * @property {Function} [onDuplicate] - Callback when field is duplicated
 * @property {Function} [onDelete] - Callback when field is deleted
 */

/**
 * Base wrapper component for form fields providing common functionality
 * @param {BaseFieldProps} props - Component properties
 */
export const BaseField = ({
  children,
  field,
  onDuplicate,
  onDelete
}) => {
  // Determine if duplication/deletion is allowed based on field config
  const allowDuplication = !field.noDuplication;
  const allowDeletion = !field.noDeletion;

  const labelExistsClass = field?.label ? 'label-exists' : '';

  /**
   * Creates a duplicate of the field with a unique name
   */
  const handleDuplicate = () => {
    if (!allowDuplication) return;

    const duplicatedField = {
      ...field,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`,
      value: field.value // Preserve the value for the duplicate
    };

    if (onDuplicate) {
      onDuplicate(duplicatedField);
    }
  };

  /**
   * Handles field deletion if allowed
   */
  const handleDelete = () => {
    if (!allowDeletion) return;

    if (onDelete) {
      onDelete(field);
    }
  };

  return (
    <div className={`form-element ${labelExistsClass} no-drop`} draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      {children}
      <div className="button-wrapper">
        {allowDuplication && (
          <div
            className="add-button"
            title="Duplicate this element"
            onClick={handleDuplicate}
          >
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div
            className="delete-button"
            title="Delete this element"
            onClick={handleDelete}
          >
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseField;
