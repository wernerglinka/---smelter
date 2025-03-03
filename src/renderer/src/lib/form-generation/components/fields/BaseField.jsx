import React from 'react';
import { DragHandleIcon } from '@components/icons';
import FieldControls from './FieldControls';

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
 * @property {boolean} [allowDuplication] - Flag to allow duplication
 * @property {boolean} [allowDeletion] - Flag to allow deletion
 */

/**
 * Base wrapper component for form fields providing common functionality
 * @param {BaseFieldProps} props - Component properties
 */
export const BaseField = ({
  children,
  field,
  onDuplicate,
  onDelete,
  allowDuplication = !field?.noDuplication,
  allowDeletion = !field?.noDeletion
}) => {
  // Add console logging to help debug
  console.log('BaseField rendered', { 
    fieldId: field?.id, 
    fieldType: field?.type,
    hasDuplicateHandler: !!onDuplicate,
    hasDeleteHandler: !!onDelete,
    allowDuplication,
    allowDeletion
  });
  
  const labelExistsClass = field?.label ? 'label-exists' : '';
  const fieldTypeClass = field?.type ? `is-${field.type}` : '';

  return (
    <div className={`form-element ${fieldTypeClass} ${labelExistsClass} no-drop`} draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      {children}
      <FieldControls
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        allowDuplication={allowDuplication}
        allowDeletion={allowDeletion}
      />
    </div>
  );
};

export default BaseField;
