import React from 'react';
import { DragHandleIcon } from '@components/icons';
import FieldControls from './FieldControls';
import { useFormOperations } from '../../../../context/FormOperationsContext';

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
 * @property {boolean} [hasError] - Whether the field has a validation error
 * @property {boolean} [isLoading] - Whether the field is in a loading state
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
  allowDeletion = !field?.noDeletion,
  hasError = false,
  isLoading = false
}) => {
  // Use the form operations context directly for fields that don't pass hasError explicitly
  const { validationErrors } = useFormOperations();
  const fieldHasError = hasError || (validationErrors && validationErrors[field?.id || field?.name]);
  
  const labelExistsClass = field?.label ? 'label-exists' : '';
  let fieldTypeClass = field?.type ? `is-${field.type}` : '';
  // if name is `contents` add `is-contents` to `fieldTypeClass`
  fieldTypeClass = `${fieldTypeClass} ${field?.name === 'contents' ? 'is-contents' : ''}`;
  
  // Add error and loading classes
  const errorClass = fieldHasError ? 'has-error' : '';
  const loadingClass = isLoading ? 'is-loading' : '';

  return (
    <div 
      className={`form-element ${fieldTypeClass} ${labelExistsClass} ${errorClass} ${loadingClass} no-drop`} 
      draggable="true"
    >
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
