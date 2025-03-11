/**
 * Field handler functions for EditSpace component
 * Handles field updates, duplications, deletions, etc.
 */

/**
 * Handles field value updates
 *
 * @param {Object} updatedField - The field with updated values
 * @param {Array} fieldPath - Path to the field in nested structure
 * @param {Function} setFormFields - State setter function for form fields
 * @param {Function} addHistoryEntry - Function to add current state to history
 */
export const handleFieldUpdate = (updatedField, fieldPath = [], setFormFields, addHistoryEntry) => {
  console.log('Field update request:', {
    id: updatedField.id,
    type: updatedField.type,
    value: updatedField.value,
    path: fieldPath
  });

  // Check if the field is likely to be found in the form
  // This helps prevent infinite loops when trying to update a field that doesn't exist
  if (!updatedField.id && !updatedField.name) {
    console.error('Field update failed: Missing field identifier', updatedField);
    return;
  }
  
  // Use the state setter function
  setFormFields((prevFields) => {
    if (!prevFields) return prevFields;

    // If we have a path, update nested field
    if (fieldPath.length > 0) {
      // Create deep copy of fields to avoid reference issues
      const newFields = JSON.parse(JSON.stringify(prevFields));

      // Navigate to the right container
      let currentContainer = newFields;
      for (let i = 0; i < fieldPath.length - 1; i++) {
        const segment = fieldPath[i];
        if (segment.type === 'array') {
          currentContainer = currentContainer[segment.index].items;
        } else if (segment.type === 'object') {
          currentContainer = currentContainer[segment.index].fields;
        }
      }

      // Update the field value only, not the entire field
      const lastSegment = fieldPath[fieldPath.length - 1];

      // Helper function to safely update field properties
      const updateFieldProperties = (targetField) => {
        if (!targetField) return;

        // Normalize field types to lowercase for comparison
        const normalizedTargetType = targetField.type?.toLowerCase();
        const normalizedUpdatedType = updatedField.type?.toLowerCase();

        // For select fields, we need special handling
        if (normalizedUpdatedType === 'select') {
          console.log('Special handling for nested select field update', {
            targetId: targetField.id,
            targetType: targetField.type
          });

          // Just update the value for select fields
          if (updatedField.value !== undefined) {
            targetField.value = updatedField.value;
          }
          return;
        }

        // Check for type mismatch before updating
        if (
          normalizedTargetType &&
          normalizedUpdatedType &&
          normalizedTargetType !== normalizedUpdatedType
        ) {
          console.error(`Field type mismatch during nested update:`, {
            fieldId: targetField.id,
            expectedType: targetField.type,
            receivedType: updatedField.type,
            field: targetField
          });
          return; // Skip update if types don't match
        }

        // Only update specific properties that were provided in the update
        if (updatedField.value !== undefined) {
          targetField.value = updatedField.value;
        }

        if (updatedField._displayLabel !== undefined) {
          targetField._displayLabel = updatedField._displayLabel;
        }
      };

      // Apply the update based on container type
      if (lastSegment.type === 'array') {
        const targetField = currentContainer[lastSegment.index].items[lastSegment.fieldIndex];
        updateFieldProperties(targetField);
      } else if (lastSegment.type === 'object') {
        const targetField = currentContainer[lastSegment.index].fields[lastSegment.fieldIndex];
        updateFieldProperties(targetField);
      } else {
        const targetField = currentContainer[lastSegment.index];
        updateFieldProperties(targetField);
      }

      // Add to history after update (without debouncing for non-text fields)
      const updatedFields = newFields;
      setTimeout(() => addHistoryEntry(updatedFields), 0);

      return newFields;
    }

    // Check if this field exists before continuing - prevent updating non-existent fields
    const fieldExists = prevFields.some(field => 
      (updatedField.id && field.id === updatedField.id) || 
      (field.name === updatedField.name)
    );
    
    if (!fieldExists) {
      console.debug('Field not found in form fields, skipping update', {
        fieldId: updatedField.id,
        fieldName: updatedField.name,
        fieldType: updatedField.type
      });
      return prevFields;
    }

    // Log all field IDs and names in the form for debugging (only if needed)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Available fields:',
        prevFields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type
        }))
      );
    }

    // Top-level field update - update only the value, not replace the entire field
    const updatedFields = prevFields.map((field) => {
      // Match by ID or if ID doesn't match, try matching by name as fallback
      const idMatch = updatedField.id && field.id === updatedField.id;
      const nameMatch = field.name === updatedField.name;

      if (idMatch || nameMatch) {
        // Only log this in development to reduce console noise
        if (process.env.NODE_ENV === 'development') {
          console.log(`Found matching field by ${idMatch ? 'ID' : 'name'}:`, {
            fieldId: field.id,
            fieldName: field.name,
            fieldType: field.type,
            updatedType: updatedField.type
          });
        }

        // Normalize field types to lowercase for comparison
        const normalizedFieldType = field.type?.toLowerCase();
        const normalizedUpdatedType = updatedField.type?.toLowerCase();

        // For select fields, we need special handling
        if (normalizedUpdatedType === 'select') {
          if (process.env.NODE_ENV === 'development') {
            console.log('Special handling for select field update');
          }
          return {
            ...field,
            value: updatedField.value // Just update the value
          };
        }

        // Check if there's a mismatch in field types before updating
        if (
          normalizedFieldType &&
          normalizedUpdatedType &&
          normalizedFieldType !== normalizedUpdatedType
        ) {
          console.error(`Field type mismatch during update:`, {
            fieldId: field.id,
            expectedType: field.type,
            receivedType: updatedField.type,
            field: field
          });
          return field; // Skip update if types don't match
        }

        // Only update the specific properties that are provided
        return {
          ...field,
          value: updatedField.value !== undefined ? updatedField.value : field.value,
          _displayLabel:
            updatedField._displayLabel !== undefined
              ? updatedField._displayLabel
              : field._displayLabel
        };
      }
      return field;
    });

    // Only add to history if the fields were actually updated
    const hasChanges = JSON.stringify(updatedFields) !== JSON.stringify(prevFields);
    if (hasChanges) {
      setTimeout(() => addHistoryEntry(updatedFields), 0);
    }

    return updatedFields;
  });
};

/**
 * Handles field duplication
 *
 * @param {Object} fieldToDuplicate - The field to duplicate
 * @param {number} index - Index of the field in the form
 * @param {Function} setFormFields - State setter function
 * @param {Function} addHistoryEntry - Function to add to history
 * @returns {boolean} Whether the operation was successful
 */
export const handleFieldDuplicate = (fieldToDuplicate, index, setFormFields, addHistoryEntry) => {
  // Check if this field has noDuplication flag set
  if (
    fieldToDuplicate.noDuplication === true ||
    fieldToDuplicate.name === 'contents' ||
    fieldToDuplicate.id === 'markdown-contents'
  ) {
    console.log('Cannot duplicate field with noDuplication flag:', fieldToDuplicate.name);

    // Show a message to the user
    const messageElement = document.createElement('div');
    messageElement.className = 'snapshot-message error';
    messageElement.textContent = `Cannot duplicate the "${fieldToDuplicate.label || fieldToDuplicate.name}" field`;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);

    return false; // Don't proceed with duplication
  }

  // Generate a unique identifier for the duplicate
  const uniqueId = `copy_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Handle label for duplicate properly, adding (Copy) suffix
  let newLabel;
  if (fieldToDuplicate.label) {
    newLabel = `${fieldToDuplicate.label}${fieldToDuplicate.label.includes('(Copy)') ? ' (Copy)' : ' (Copy)'}`;
  }

  // Create duplicated field with unique ID
  // Deep clone the field to avoid reference issues
  const fieldCopy = JSON.parse(JSON.stringify(fieldToDuplicate));

  // Set the label to empty string to make it editable
  // This is all we need since readOnly={!!label} checks if label exists
  const duplicatedField = {
    ...fieldCopy,
    id: `${fieldToDuplicate.id}_${uniqueId}`,
    name: `${fieldToDuplicate.name}_${uniqueId}`,
    label: '' // Empty label makes readOnly={!!label} evaluate to false
  };

  // Store the label suggestion in a custom property
  duplicatedField._displayLabel = newLabel;

  console.log('Duplicating field', {
    original: fieldToDuplicate.id,
    duplicate: duplicatedField.id,
    index: index,
    originalLabel: fieldToDuplicate.label,
    duplicateLabel: duplicatedField.label
  });

  // Use the index directly from the map function
  setFormFields((prevFields) => {
    // Safety check - make sure index is valid
    if (index < 0 || index >= prevFields.length) {
      console.error('Invalid index for duplication:', index);
      return prevFields;
    }

    const newFields = [...prevFields];
    // Insert after the current index (no need to search by ID)
    newFields.splice(index + 1, 0, duplicatedField);

    // Add to history after update
    setTimeout(() => {
      if (addHistoryEntry) {
        addHistoryEntry(newFields);
      }
    }, 0);

    return newFields;
  });

  return true;
};

/**
 * Handles field deletion
 *
 * @param {Object} fieldToDelete - The field to delete
 * @param {number} index - Index of the field in the form
 * @param {Function} setFormFields - State setter function
 * @param {Function} addHistoryEntry - Function to add to history
 * @returns {boolean} Whether the operation was successful
 */
export const handleFieldDelete = (fieldToDelete, index, setFormFields, addHistoryEntry) => {
  // Check if this field has noDeletion flag set
  if (
    fieldToDelete.noDeletion === true ||
    fieldToDelete.name === 'contents' ||
    fieldToDelete.id === 'markdown-contents'
  ) {
    console.log('Cannot delete field with noDeletion flag:', fieldToDelete.name);

    // Show a message to the user
    const messageElement = document.createElement('div');
    messageElement.className = 'snapshot-message error';
    messageElement.textContent = `Cannot delete the "${fieldToDelete.label || fieldToDelete.name}" field`;
    document.body.appendChild(messageElement);

    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);

    return false; // Don't proceed with deletion
  }

  console.log('Deleting field', {
    id: fieldToDelete.id,
    index: index,
    clickedField: fieldToDelete
  });

  // Use the index parameter directly from the map function
  // This ensures we delete exactly the item that was clicked
  setFormFields((prevFields) => {
    // Safety check - make sure index is valid
    if (index < 0 || index >= prevFields.length) {
      console.error('Invalid index for deletion:', index);
      return prevFields;
    }

    // Log the field we're about to delete to verify it's correct
    console.log(
      'About to delete field at index',
      index,
      'name:',
      prevFields[index].name,
      'id:',
      prevFields[index].id
    );

    // Create a new array without the field at the current index
    const newFields = [...prevFields.slice(0, index), ...prevFields.slice(index + 1)];

    // Add to history after update
    setTimeout(() => {
      if (addHistoryEntry) {
        addHistoryEntry(newFields);
      }
    }, 0);

    return newFields;
  });

  return true;
};

/**
 * Handles dropzone events (field addition, reordering)
 *
 * @param {Object} event - Dropzone event
 * @param {string} event.type - Event type ('template', 'sidebar', 'reorder')
 * @param {Object} event.data - Event data
 * @param {Object} event.position - Position information
 * @param {Function} setFormFields - Form fields state setter
 * @param {Function} addHistoryEntry - Function to add to history
 */
export const handleDropzoneEvent = async (
  { type, data, position },
  setFormFields,
  addHistoryEntry,
  createFieldFromTemplate
) => {
  // Helper to update and add to history
  const updateAndAddToHistory = (newFields) => {
    setTimeout(() => addHistoryEntry(newFields), 0);
  };

  switch (type) {
    case 'template': {
      try {
        const StorageOperations = await import('@utils/services/storage');
        const projectPath = StorageOperations.getProjectPath();
        if (!projectPath) {
          throw new Error('Project path not found');
        }

        const templateUrl = data.url.replace(/^\/+|\/+$/g, '');
        const templatePath = `${projectPath}/.metallurgy/frontMatterTemplates/templates/${templateUrl}`;

        const result = await window.electronAPI.files.read(templatePath);

        if (result.status === 'failure') {
          throw new Error(`Failed to read template: ${result.error}`);
        }

        const rawTemplate = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;

        // Use the existing processFrontmatter function to transform the template
        const { processFrontmatter } = await import(
          '@lib/form-generation/processors/frontmatter-processor'
        );
        const processedData = await processFrontmatter(rawTemplate, '');

        setFormFields((prevFields) => {
          const newFields = [...(prevFields || [])];
          if (position && typeof position.targetIndex === 'number') {
            newFields.splice(position.targetIndex, 0, ...processedData.fields);
          } else {
            newFields.push(...processedData.fields);
          }
          // Add to history after update
          updateAndAddToHistory(newFields);
          return newFields;
        });
      } catch (error) {
        console.error('Error inserting template:', error);
      }
      break;
    }
    case 'sidebar': {
      try {
        const newField = createFieldFromTemplate(data);
        setFormFields((prevFields) => {
          const newFields = [...(prevFields || [])];
          if (position && typeof position.targetIndex === 'number') {
            newFields.splice(position.targetIndex, 0, newField);
          } else {
            newFields.push(newField);
          }
          // Add to history after update
          updateAndAddToHistory(newFields);
          return newFields;
        });
      } catch (error) {
        console.error('Error creating field:', error);
      }
      break;
    }
    case 'reorder': {
      try {
        const sourceIndex = data.index;
        setFormFields((prevFields) => {
          const newFields = [...prevFields];
          const [movedField] = newFields.splice(sourceIndex, 1);
          newFields.splice(position.targetIndex, 0, movedField);
          // Add to history after update
          updateAndAddToHistory(newFields);
          return newFields;
        });
      } catch (error) {
        console.error('Error reordering fields:', error);
      }
      break;
    }
  }
};

/**
 * Handles clearing the dropzone
 *
 * @param {Event} e - Click event
 * @param {Function} setFormFields - Form fields state setter
 * @param {Function} addHistoryEntry - Function to add to history
 */
export const handleClearDropzone = (e, setFormFields, addHistoryEntry) => {
  e.preventDefault();
  setFormFields([]);
  // Add to history after update
  setTimeout(() => {
    if (addHistoryEntry) {
      addHistoryEntry([]);
    }
  }, 0);
};
