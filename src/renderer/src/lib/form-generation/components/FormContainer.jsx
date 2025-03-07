import React, { useState } from 'react';
import { FormField } from './FormField';

/**
 * Form container component that manages top-level form elements
 * Provides add/delete functionality for all form elements
 *
 * @param {Object} props - Component props
 * @param {Array} props.initialFields - Initial form fields array
 * @param {string} props.className - Additional CSS class
 * @returns {JSX.Element} Rendered form container
 */
export const FormContainer = ({ initialFields = [], className = '' }) => {
  const [fields, setFields] = useState(initialFields);

  /**
   * Handles field duplication at any level
   * @param {Object} fieldToDuplicate - Field to duplicate
   */
  const handleFieldDuplicate = (fieldToDuplicate) => {
    const duplicatedField = {
      ...fieldToDuplicate,
      id: `${fieldToDuplicate.id}_copy`,
      name: `${fieldToDuplicate.name}_copy`,
      label: fieldToDuplicate.label ? `${fieldToDuplicate.label} (Copy)` : undefined
    };

    setFields((currentFields) => {
      const index = currentFields.findIndex((f) => f.id === fieldToDuplicate.id);
      if (index !== -1) {
        const newFields = [...currentFields];
        newFields.splice(index + 1, 0, duplicatedField);
        return newFields;
      }
      return currentFields;
    });
  };

  /**
   * Handles field deletion at any level
   * @param {Object} fieldToDelete - Field to delete
   */
  const handleFieldDelete = (fieldToDelete) => {
    setFields((currentFields) => currentFields.filter((f) => f.id !== fieldToDelete.id));
  };

  return (
    <div className={`main-dropzone dropzone js-dropzone ${className}`}>
      {fields.map((field) => (
        <FormField
          key={field.id}
          field={field}
          onFieldDuplicate={handleFieldDuplicate}
          onFieldDelete={handleFieldDelete}
          parentType="main"
        />
      ))}
    </div>
  );
};

export default FormContainer;
