import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@utils/services/logger';

/**
 * Context for managing form editing state and operations
 */
const EditContext = createContext(null);

/**
 * EditProvider component that provides form editing functionality
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 */
export const EditProvider = ({ children }) => {
  const [formFields, setFormFields] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [fileName, setFileName] = useState(null);
  
  /**
   * Updates a field in the form
   * 
   * @param {Object} updatedField The field with updated values
   * @param {Array} fieldPath Path to the field in nested structure
   * @param {Function} addHistoryEntry Function to add current state to history
   */
  const updateField = useCallback((updatedField, fieldPath = [], addHistoryEntry) => {
    logger.debug('Field update request:', {
      id: updatedField.id,
      type: updatedField.type,
      value: updatedField.value,
      path: fieldPath
    });

    // Check if the field is likely to be found in the form
    if (!updatedField.id && !updatedField.name) {
      logger.error('Field update failed: Missing field identifier', updatedField);
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
            logger.debug('Special handling for nested select field update', {
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
            logger.error(`Field type mismatch during nested update:`, {
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
        if (addHistoryEntry) {
          setTimeout(() => addHistoryEntry(updatedFields), 0);
        }

        return newFields;
      }

      // Check if this field exists before continuing - prevent updating non-existent fields
      const fieldExists = prevFields.some(field => 
        (updatedField.id && field.id === updatedField.id) || 
        (field.name === updatedField.name)
      );
      
      if (!fieldExists) {
        logger.debug('Field not found in form fields, skipping update', {
          fieldId: updatedField.id,
          fieldName: updatedField.name,
          fieldType: updatedField.type
        });
        return prevFields;
      }

      // Top-level field update - update only the value, not replace the entire field
      const updatedFields = prevFields.map((field) => {
        // Match by ID or if ID doesn't match, try matching by name as fallback
        const idMatch = updatedField.id && field.id === updatedField.id;
        const nameMatch = field.name === updatedField.name;

        if (idMatch || nameMatch) {
          // Normalize field types to lowercase for comparison
          const normalizedFieldType = field.type?.toLowerCase();
          const normalizedUpdatedType = updatedField.type?.toLowerCase();

          // For select fields, we need special handling
          if (normalizedUpdatedType === 'select') {
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
            logger.error(`Field type mismatch during update:`, {
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
      if (hasChanges && addHistoryEntry) {
        setTimeout(() => addHistoryEntry(updatedFields), 0);
      }

      return updatedFields;
    });
  }, []);
  
  /**
   * Duplicates a field in the form
   * 
   * @param {Object} fieldToDuplicate The field to duplicate
   * @param {number} index Index of the field in the form
   * @param {Function} addHistoryEntry Function to add to history
   * @returns {boolean} Whether the operation was successful
   */
  const duplicateField = useCallback((fieldToDuplicate, index, addHistoryEntry) => {
    // Check if this field has noDuplication flag set
    if (
      fieldToDuplicate.noDuplication === true ||
      fieldToDuplicate.name === 'contents' ||
      fieldToDuplicate.id === 'markdown-contents'
    ) {
      logger.info('Cannot duplicate field with noDuplication flag:', fieldToDuplicate.name);

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

    logger.debug('Duplicating field', {
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
        logger.error('Invalid index for duplication:', index);
        return prevFields;
      }

      const newFields = [...prevFields];
      // Insert after the current index (no need to search by ID)
      newFields.splice(index + 1, 0, duplicatedField);

      // Add to history after update
      if (addHistoryEntry) {
        setTimeout(() => addHistoryEntry(newFields), 0);
      }

      return newFields;
    });

    return true;
  }, []);
  
  /**
   * Deletes a field from the form
   * 
   * @param {Object} fieldToDelete The field to delete
   * @param {number} index Index of the field in the form
   * @param {Function} addHistoryEntry Function to add to history
   * @returns {boolean} Whether the operation was successful
   */
  const deleteField = useCallback((fieldToDelete, index, addHistoryEntry) => {
    // Check if this field has noDeletion flag set
    if (
      fieldToDelete.noDeletion === true ||
      fieldToDelete.name === 'contents' ||
      fieldToDelete.id === 'markdown-contents'
    ) {
      logger.info('Cannot delete field with noDeletion flag:', fieldToDelete.name);

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

    logger.debug('Deleting field', {
      id: fieldToDelete.id,
      index: index,
      clickedField: fieldToDelete
    });

    // Use the index parameter directly from the map function
    // This ensures we delete exactly the item that was clicked
    setFormFields((prevFields) => {
      // Safety check - make sure index is valid
      if (index < 0 || index >= prevFields.length) {
        logger.error('Invalid index for deletion:', index);
        return prevFields;
      }

      // Create a new array without the field at the current index
      const newFields = [...prevFields.slice(0, index), ...prevFields.slice(index + 1)];

      // Add to history after update
      if (addHistoryEntry) {
        setTimeout(() => addHistoryEntry(newFields), 0);
      }

      return newFields;
    });

    return true;
  }, []);
  
  /**
   * Creates a field object from a template
   * 
   * @param {Object} template Field template
   * @returns {Object} Field object with type and default value
   */
  const createFieldFromTemplate = useCallback((template) => {
    if (!template || typeof template !== 'object') {
      throw new Error('Invalid template: must be an object');
    }

    const type = (template.type || 'text').toUpperCase();
    
    // We'll need to import this dynamically to avoid circular dependencies
    const fieldType = {
      TEXT: { type: 'text', default: '' },
      NUMBER: { type: 'number', default: 0 },
      SELECT: { type: 'select', default: '' },
      DATE: { type: 'date', default: '' },
      BOOLEAN: { type: 'checkbox', default: false },
      OBJECT: { type: 'object', default: {} },
      ARRAY: { type: 'array', default: [] },
      TEXTAREA: { type: 'textarea', default: '' },
      URL: { type: 'url', default: '' },
      // Add any other field types you need
    }[type];

    if (!fieldType) {
      throw new Error(`Invalid field type: ${type}`);
    }

    return {
      ...template,
      id: `field-${Date.now()}`,
      type: fieldType.type,
      value: template.value || fieldType.default
    };
  }, []);
  
  /**
   * Handles dropzone events (field addition, reordering)
   * 
   * @param {Object} event Dropzone event
   * @param {Function} addHistoryEntry Function to add to history
   */
  const handleDropEvent = useCallback(async (event, addHistoryEntry) => {
    const { type, data, position } = event;
    
    // Helper to update and add to history
    const updateAndAddToHistory = (newFields) => {
      if (addHistoryEntry) {
        setTimeout(() => addHistoryEntry(newFields), 0);
      }
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
          logger.error('Error inserting template:', error);
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
          logger.error('Error creating field:', error);
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
          logger.error('Error reordering fields:', error);
        }
        break;
      }
    }
  }, [createFieldFromTemplate]);
  
  /**
   * Clears all fields from the form
   * 
   * @param {Event} e Click event
   * @param {Function} addHistoryEntry Function to add to history
   */
  const clearFields = useCallback((e, addHistoryEntry) => {
    if (e) e.preventDefault();
    setFormFields([]);
    // Add to history after update
    if (addHistoryEntry) {
      setTimeout(() => addHistoryEntry([]), 0);
    }
  }, []);
  
  /**
   * Process file content (frontmatter and markdown)
   * 
   * @param {Object} fileContent File content object
   * @param {Function} onResetHistory Callback to reset history state
   */
  const processFileContent = useCallback(async (fileContent, onResetHistory) => {
    if (fileContent?.data?.frontmatter) {
      try {
        // Dynamically import to avoid circular dependencies
        const { processFrontmatter } = await import(
          '@lib/form-generation/processors/frontmatter-processor'
        );

        // Determine if we should add contents field based on content existence and file type
        const hasContent = fileContent.data.content && fileContent.data.content.trim().length > 0;
        const hasFrontmatter = Object.keys(fileContent.data.frontmatter).length > 0;
        const isJsonFile = fileContent.type === 'json' || (fileContent.path && fileContent.path.toLowerCase().endsWith('.json'));
        
        logger.debug('Processing file content', { 
          type: fileContent.type, 
          path: fileContent.path,
          isJsonFile,
          hasContent,
          hasFrontmatter
        });

        // Only add contents field if:
        // 1. It's not a JSON file, AND
        // 2. There is actual content or frontmatter is present
        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content || '', // Ensure we always pass at least an empty string for content
          { addContentsField: !isJsonFile && (hasContent || hasFrontmatter) }
        );

        // Clear previous form fields first to prevent persistence between files
        setFormFields(null);
        
        // Call reset history callback
        if (onResetHistory) {
          onResetHistory(processedData.fields);
        }

        // Set file information
        setActiveFilePath(fileContent.path);
        setFileName(fileContent.path.split('/').pop());

        // Then set the new fields after a short delay
        setTimeout(() => {
          setFormFields(processedData.fields);
        }, 10);
      } catch (error) {
        logger.error('Error processing content:', error);
      }
    } else {
      // For files without frontmatter (like new JSON files)
      try {
        logger.debug('Processing file without frontmatter', { path: fileContent.path });
        
        // Always preserve the file path even for empty files
        if (fileContent.path) {
          setActiveFilePath(fileContent.path);
          setFileName(fileContent.path.split('/').pop());
        }
        
        // Initialize with empty fields array instead of null
        const emptyFields = [];
        
        // Call reset history callback
        if (onResetHistory) {
          onResetHistory(emptyFields);
        }
        
        // Set empty fields
        setFormFields(emptyFields);
        
      } catch (error) {
        logger.error('Error processing file without frontmatter:', {
          error: error.message,
          path: fileContent?.path
        });
        
        // Don't clear the path in case of error
        if (fileContent?.path) {
          setActiveFilePath(fileContent.path);
          setFileName(fileContent.path.split('/').pop());
        }
      }
    }
  }, []);

  /**
   * Reset form to a specific state
   * 
   * @param {Object} restoredState State to restore
   */
  const resetForm = useCallback((restoredState) => {
    if (!restoredState) {
      setFormFields([]);
      return;
    }

    // Parse if it's a string
    const parsedState = typeof restoredState === 'string' 
      ? JSON.parse(restoredState) 
      : restoredState;
      
    setFormFields(parsedState);
  }, []);
  
  const value = {
    formFields,
    activeFilePath,
    fileName,
    updateField,
    duplicateField,
    deleteField,
    handleDropEvent,
    clearFields,
    processFileContent,
    resetForm
  };
  
  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
};

/**
 * Hook to access the edit context
 * @returns {Object} Edit context value
 */
export const useEdit = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEdit must be used within an EditProvider');
  }
  return context;
};