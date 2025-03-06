import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon, RedoIcon, UndoIcon, SnapshotIcon } from '@components/icons';
import { FIELD_TYPES } from '@lib/form-generation/schema/field-types';
import { setupEditor } from './editor';
import 'easymde/dist/easymde.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { StorageOperations } from '@services/storage';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

import './styles.css';

const createFieldFromTemplate = (template) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Invalid template: must be an object');
  }

  const type = (template.type || 'text').toUpperCase();
  const fieldType = FIELD_TYPES[type];

  if (!fieldType) {
    throw new Error(`Invalid field type: ${type}`);
  }

  return {
    ...template,
    id: `field-${Date.now()}`,
    type: fieldType.type,
    value: template.value || fieldType.default
  };
};

const processTemplateField = (key, value, parentId = '') => {
  const fieldId = `field-${Date.now()}-${parentId}${key}`;

  if (value === null || value === undefined) {
    return {
      id: fieldId,
      name: key,
      type: 'TEXT',
      label: toTitleCase(key),
      value: ''
    };
  }

  // Handle different types
  if (typeof value === 'object' && !Array.isArray(value)) {
    return {
      id: fieldId,
      name: key,
      type: 'OBJECT',
      label: toTitleCase(key),
      fields: Object.entries(value).map(([k, v]) => processTemplateField(k, v, `${fieldId}-`))
    };
  }

  if (Array.isArray(value)) {
    return {
      id: fieldId,
      name: key,
      type: 'ARRAY',
      label: toTitleCase(key),
      items: value.map((item, index) => processTemplateField(`${index}`, item, `${fieldId}-`))
    };
  }

  return {
    id: fieldId,
    name: key,
    type: typeof value === 'boolean' ? 'BOOLEAN' : 'TEXT',
    label: toTitleCase(key),
    value: value
  };
};

/**
 * Main editing space component that handles file content processing and form rendering
 * @param {Object} props Component props
 * @param {boolean} props.$expanded Whether the edit space is in expanded mode
 * @param {Object} props.fileContent The content of the file being edited
 */
const EditSpace = ({ fileContent, $expanded }) => {
  const formRef = useRef(null);
  const [ formFields, setFormFields ] = useState(null);
  const [ activeFilePath, setActiveFilePath ] = useState(null);
  const [ fileName, setFileName ] = useState( null );
  const [ redoLevel, setRedoLevel ] = useState(0);
  const lastUpdateTimeRef = useRef(0); // Track last update time to debounce history entries
  
  // History management for undo/redo
  const [ history, setHistory ] = useState([]);
  const [ historyPosition, setHistoryPosition ] = useState(-1);
  const [ snapshots, setSnapshots ] = useState([]);
  const MAX_HISTORY = 10;
  
  // Function to add current state to history
  const addToHistory = useCallback((formState) => {
    // Skip if formState is null or undefined
    if (!formState) return;
    
    // Deep copy to prevent reference issues
    const snapshot = JSON.stringify(formState);
    
    setHistory(prevHistory => {
      // If we're not at the end of history, truncate
      const newHistory = historyPosition < prevHistory.length - 1 
        ? prevHistory.slice(0, historyPosition + 1) 
        : [...prevHistory];
      
      // Limit history size to MAX_HISTORY
      const limitedHistory = newHistory.length >= MAX_HISTORY 
        ? newHistory.slice(newHistory.length - MAX_HISTORY + 1) 
        : newHistory;
      
      // Return updated history array
      return [...limitedHistory, snapshot];
    });
    
    // Update position after history is updated
    setHistoryPosition(prev => {
      const newPosition = prev < history.length ? prev + 1 : history.length;
      setRedoLevel(newPosition);
      return newPosition;
    });
  }, [history.length, historyPosition]);
  
  // Helper function to handle undo/redo using FormData
  const handleFormReset = useCallback((restoredState) => {
    console.log('Handling form reset using FormData');
    
    if (!formRef.current || !restoredState) return;
    
    // First update React state so components render correctly
    setFormFields(restoredState);
    
    // Use setTimeout to ensure the DOM has updated with new fields
    setTimeout(() => {
      const form = formRef.current;
      if (!form) return;
      
      // Process all fields in the restored state including nested ones
      const processFields = (fields, parentPath = '') => {
        if (!fields || !Array.isArray(fields)) return;
        
        fields.forEach((field, index) => {
          // Build the current path for debugging
          const currentPath = parentPath ? `${parentPath}[${index}]` : '';
          console.log(`Processing field: ${field.name || 'unnamed'}, type: ${field.type}, path: ${currentPath}`);
          
          // Handle different field types
          if (field.type === 'object' && field.fields) {
            console.log(`Processing object fields for ${field.name}`);
            // Recursively process object fields with updated path
            processFields(field.fields, field.name);
          } else if (field.type === 'array' && field.items) {
            console.log(`Processing array items for ${field.name}`);
            // Recursively process array items with updated path
            processFields(field.items, field.name);
          } else if (field.name && field.value !== undefined) {
            // Basic field with a name and value
            try {
              // Build a selector based on the parent path
              // This helps locate nested fields more precisely
              const buildNameSelector = (fieldName, parentPath) => {
                if (!parentPath) {
                  return `[name="${fieldName}"]`;
                }
                
                // This matches the pattern: parentPath[index][fieldName]
                return `[name^="${parentPath}"][name$="[${fieldName}]"]`;
              };
              
              // Try different selector patterns for finding the field
              // First try with parent path context if available
              const contextSelector = parentPath ? buildNameSelector(field.name, parentPath) : `[name="${field.name}"]`;
              console.log(`Trying selector with context: ${contextSelector}`);
              let element = form.querySelector(contextSelector);
              
              // If not found, try more general patterns
              if (!element) {
                console.log(`Element not found with context selector, trying general patterns`);
                // Create broader selector that would match array or object nested fields
                const namePattern = field.name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
                const nestedSelectors = [
                  // Exact match (already tried above)
                  `[name="${field.name}"]`,
                  // Array notation: name[0], name[1], etc.
                  `[name^="${field.name}["]`,
                  // Fields inside arrays: parent[0][fieldName] - very important for our structure
                  `[name$="[${field.name}]"]`,
                  // Object notation with array parent: parent[0].name
                  `[name$=".${field.name}"]`,
                  // Complex nested: something[0].nested.name
                  `[name*=".${field.name}."]`,
                  // Last resort - any element with this name fragment
                  `[name*="${namePattern}"]`
                ];
                
                // Try each selector pattern
                for (const selector of nestedSelectors) {
                  try {
                    const elements = form.querySelectorAll(selector);
                    if (elements.length > 0) {
                      console.log(`Found ${elements.length} elements matching selector: ${selector}`);
                      // Just use the first matching element for now
                      element = elements[0];
                      break;
                    }
                  } catch (err) {
                    console.error(`Error with selector "${selector}":`, err);
                  }
                }
              }
              
              if (!element) {
                console.warn(`Could not find element for field ${field.name} in the DOM`);
                return; // Skip if element not found
              }
              
              console.log(`Found element for field ${field.name}, type: ${element.type}`);
              
              if (element.type === 'checkbox') {
                // Checkbox
                console.log(`Resetting checkbox ${field.name} to ${Boolean(field.value)}`);
                element.checked = Boolean(field.value);
              } else if (element.type === 'radio') {
                // Radio button
                const radio = form.querySelector(`[name="${field.name}"][value="${field.value}"]`);
                if (radio) radio.checked = true;
              } else if (element.tagName === 'SELECT') {
                // Select dropdown - handle both string and object values
                const valueToSet = field.value !== null ? field.value.toString() : '';
                element.value = valueToSet;
                
                // If the value wasn't set properly (might happen with complex values)
                if (element.value !== valueToSet) {
                  // Try to find the option by text content
                  Array.from(element.options).forEach(option => {
                    if (option.textContent.trim() === valueToSet) {
                      element.selectedIndex = option.index;
                    }
                  });
                }
              } else {
                // Regular input field
                element.value = field.value;
              }
            } catch (err) {
              console.error(`Error updating field ${field.name}:`, err);
            }
          }
        });
      };
      
      // Debug: Log all form elements with their names to help debug nested fields
      console.log('All form elements:', Array.from(form.querySelectorAll('[name]')).map(el => ({
        name: el.getAttribute('name'),
        type: el.type || el.tagName.toLowerCase(),
        value: el.value
      })));
      
      // Start processing the fields
      processFields(restoredState, '');
      
      console.log('Form values restored using DOM manipulation');
    }, 50); // Give DOM time to update
  }, []);
  
  // Handle undo action
  const handleUndo = useCallback(() => {
    if (historyPosition > 0) {
      const prevPosition = historyPosition - 1;
      setHistoryPosition(prevPosition);
      setRedoLevel(prevPosition);
      
      // Only try to parse if we have valid history at this position
      if (history[prevPosition]) {
        try {
          console.log('Restoring state from history position:', prevPosition);
          
          // Parse the state from history
          const restoredState = JSON.parse(history[prevPosition]);
          
          // Log the restored state for debugging
          console.log('Restored state:', restoredState);
          
          // Force uncontrolled components to reset with new defaults
          handleFormReset(restoredState);
        } catch (err) {
          console.error('Error parsing or applying history state:', err);
        }
      }
    }
  }, [history, historyPosition, handleFormReset]);
  
  // Handle redo action
  const handleRedo = useCallback(() => {
    if (historyPosition < history.length - 1) {
      const nextPosition = historyPosition + 1;
      setHistoryPosition(nextPosition);
      setRedoLevel(nextPosition);
      
      // Only try to parse if we have valid history at this position
      if (history[nextPosition]) {
        try {
          console.log('Restoring state from history position:', nextPosition);
          
          // Parse the state from history
          const restoredState = JSON.parse(history[nextPosition]);
          
          // Log the restored state for debugging
          console.log('Restored state for redo:', restoredState);
          
          // Force uncontrolled components to reset with new defaults
          handleFormReset(restoredState);
        } catch (err) {
          console.error('Error parsing or applying history state:', err);
        }
      }
    }
  }, [history, historyPosition, handleFormReset]);

  // Helper function to add entry to history
  const addHistoryEntry = useCallback((formState) => {
    setHistory(prevHistory => {
      // Create snapshot of form state
      const snapshot = JSON.stringify(formState);
      
      // If we're not at the end of history, truncate
      const newHistory = historyPosition < prevHistory.length - 1 
        ? prevHistory.slice(0, historyPosition + 1) 
        : [...prevHistory];
      
      // Limit history size
      const limitedHistory = newHistory.length >= MAX_HISTORY 
        ? newHistory.slice(newHistory.length - MAX_HISTORY + 1) 
        : newHistory;
      
      const newPosition = limitedHistory.length;
      // Schedule position updates
      setTimeout(() => {
        setHistoryPosition(newPosition);
        setRedoLevel(newPosition);
      }, 0);
      
      return [...limitedHistory, snapshot];
    });
  }, [historyPosition]);
  
  // Handle field value updates
  const handleFieldUpdate = useCallback((updatedField, fieldPath = []) => {
    console.log('Field update request:', {
      id: updatedField.id,
      type: updatedField.type, 
      value: updatedField.value,
      path: fieldPath
    });
    
    // Update the form field state with the new value
    setFormFields(prevFields => {
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
          if (normalizedTargetType && normalizedUpdatedType && normalizedTargetType !== normalizedUpdatedType) {
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
      
      // Check if we have an ID or name to identify the field
      if (!updatedField.id && !updatedField.name) {
        console.error('Field update failed: Missing field identifier', updatedField);
        return prevFields;
      }
      
      // Log all field IDs and names in the form for debugging
      console.log('Available fields:', prevFields.map(f => ({ 
        id: f.id, 
        name: f.name,
        type: f.type 
      })));
      
      // Top-level field update - update only the value, not replace the entire field
      const updatedFields = prevFields.map(field => {
        // Match by ID or if ID doesn't match, try matching by name as fallback
        const idMatch = updatedField.id && field.id === updatedField.id;
        const nameMatch = field.name === updatedField.name;
        
        if (idMatch || nameMatch) {
          console.log(`Found matching field by ${idMatch ? 'ID' : 'name'}:`, {
            fieldId: field.id,
            fieldName: field.name,
            fieldType: field.type,
            updatedType: updatedField.type
          });
          
          // Normalize field types to lowercase for comparison
          const normalizedFieldType = field.type?.toLowerCase();
          const normalizedUpdatedType = updatedField.type?.toLowerCase();
          
          // For select fields, we need special handling
          if (normalizedUpdatedType === 'select') {
            console.log('Special handling for select field update');
            return {
              ...field, 
              value: updatedField.value // Just update the value
            };
          }
          
          // Check if there's a mismatch in field types before updating
          if (normalizedFieldType && normalizedUpdatedType && normalizedFieldType !== normalizedUpdatedType) {
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
            _displayLabel: updatedField._displayLabel !== undefined ? updatedField._displayLabel : field._displayLabel
          };
        }
        return field;
      });
      
      // Add to history after update
      setTimeout(() => addHistoryEntry(updatedFields), 0);
      
      return updatedFields;
    });
  }, [addHistoryEntry]);
  
  // Handle creating a named snapshot
  const handleCreateSnapshot = useCallback(() => {
    if (!formFields) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const name = `Snapshot ${snapshots.length + 1} (${timestamp})`;
    
    const snapshot = {
      name,
      state: JSON.stringify(formFields),
      timestamp: new Date().toISOString()
    };
    
    setSnapshots(prev => [...prev, snapshot]);
    
    // Inform user
    console.log(`Created snapshot: ${name}`);
    
    // Show a temporary message
    const messageElement = document.createElement('div');
    messageElement.className = 'snapshot-message';
    messageElement.textContent = `Snapshot created: ${name}`;
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }, [formFields, snapshots]);
  
  // Handle restoring a snapshot
  const handleRestoreSnapshot = useCallback((index) => {
    if (index >= 0 && index < snapshots.length) {
      try {
        const restoredFields = JSON.parse(snapshots[index].state);
        
        // Use the form reset function to properly update both state and DOM
        handleFormReset(restoredFields);
        
        // Add this restoration to history by directly updating
        // to avoid potential circular dependencies with addToHistory
        setHistory(prevHistory => {
          // If we're not at the end of history, truncate
          const newHistory = historyPosition < prevHistory.length - 1 
            ? prevHistory.slice(0, historyPosition + 1) 
            : [...prevHistory];
          
          // Return updated history with snapshot state
          return [...newHistory, snapshots[index].state];
        });
        
        // Update position
        setHistoryPosition(prev => prev + 1);
        setRedoLevel(prev => prev + 1);
        
        // Inform user
        console.log(`Restored snapshot: ${snapshots[index].name}`);
      } catch (err) {
        console.error('Error restoring snapshot:', err);
      }
    }
  }, [snapshots, historyPosition, handleFormReset]);
  
  // State to control snapshot list visibility
  const [showSnapshotList, setShowSnapshotList] = useState(false);

  // Setup editor when component mounts
  useEffect(() => {
    const cleanupEditor = setupEditor();
    
    // No need for click outside handler anymore since we're using hover behavior
    
    // Cleanup when component unmounts
    return () => {
      cleanupEditor();
    };
  }, []);

  // Process content when fileContent changes
  useEffect(() => {
    const processContent = async () => {
      if (fileContent?.data?.frontmatter) {
        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content || '' // Ensure we always pass at least an empty string for content
        );
        // Clear previous form fields first to prevent persistence between files
        setFormFields(null);
        // Reset history when loading a new file
        setHistory([]);
        setHistoryPosition(-1);
        setRedoLevel(0);
        setSnapshots([]);
        
        // Then set the new fields after a short delay
        setTimeout(() => {
          setFormFields(processedData.fields);
          setActiveFilePath(fileContent.path);
          setFileName(fileContent.path.split('/').pop());
          
          // Initialize history with the first state - but don't use addToHistory
          // to avoid potential dependency issues
          setHistory([JSON.stringify(processedData.fields)]);
          setHistoryPosition(0);
          setRedoLevel(0);
        }, 10);
      } else {
        // Reset form fields when no content is loaded
        setFormFields(null);
        setActiveFilePath(null);
        setFileName(null);
        // Reset history
        setHistory([]);
        setHistoryPosition(-1);
        setRedoLevel(0);
        setSnapshots([]);
      }
    };

    processContent();
  }, [fileContent]);

  // Handle dropzone events (field addition, reordering)
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    // Use the addHistoryEntry function that's defined earlier
    const updateAndAddToHistory = (newFields) => {
      setTimeout(() => addHistoryEntry(newFields), 0);
    };
    
    switch (type) {
      case 'template': {
        try {
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
          const processedData = await processFrontmatter(rawTemplate, '');

          setFormFields(prevFields => {
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
          setFormFields(prevFields => {
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
          setFormFields(prevFields => {
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
  }, []);

  const handleClearDropzone = useCallback((e) => {
    e.preventDefault();
    setFormFields([]);
    // Add to history after update
    setTimeout(() => {
      if (addHistoryEntry) {
        addHistoryEntry([]);
      }
    }, 0);
  }, []);

  return (
    <main className={`edit-container container-background ${$expanded ? 'expanded' : ''}`}>
      <h2 id="file-name">
        {fileName}
        <span id="preview-button" className="btn" role="button" title="Open preview pane">
          <PreviewShowIcon />
        </span>
        <div id="undo-redo-wrapper">
          <span 
            className={`undo btn ${historyPosition <= 0 ? 'disabled' : ''}`} 
            role="button" 
            title="undo last form change"
            onClick={handleUndo}
          >
            <UndoIcon />
          </span>
          <span className="undo-redo-count">{ redoLevel }</span>
          <span 
            className={`redo btn ${historyPosition >= history.length - 1 ? 'disabled' : ''}`} 
            role="button" 
            title="redo last form change"
            onClick={handleRedo}
          >
            <RedoIcon />
          </span>
          <div className="snapshot-container">
            <span 
              className="snapshot btn" 
              role="button" 
              title="take snapshot of form"
              onClick={() => {
                // Only create a new snapshot
                handleCreateSnapshot();
              }}
              onMouseEnter={() => {
                // Show snapshot list on hover if we have snapshots
                if (snapshots.length > 0) {
                  setShowSnapshotList(true);
                }
              }}
            >
              <SnapshotIcon />
            </span>
            
            {snapshots.length > 0 && (
              <div 
                className={`snapshot-list ${showSnapshotList ? 'visible' : ''}`}
                onMouseLeave={() => setShowSnapshotList(false)}
              >
                <div className="snapshot-list-header">Saved Snapshots</div>
                {snapshots.map((snapshot, index) => (
                  <div 
                    key={snapshot.timestamp} 
                    className="snapshot-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      
                      // Show restoration message
                      const messageElement = document.createElement('div');
                      messageElement.className = 'snapshot-message';
                      messageElement.textContent = `Restoring: ${snapshot.name}`;
                      document.body.appendChild(messageElement);
                      
                      // Remove message after 3 seconds
                      setTimeout(() => {
                        if (messageElement.parentNode) {
                          messageElement.parentNode.removeChild(messageElement);
                        }
                      }, 3000);
                      
                      // Restore the snapshot
                      handleRestoreSnapshot(index);
                      setShowSnapshotList(false);
                    }}
                  >
                    {snapshot.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </h2>
      <div id="content-container">
        {fileContent && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              
              // Submit the form
              handleFormSubmission(formRef.current, activeFilePath);
              
              // Reset history and snapshots after submission
              setHistory([]);
              setHistoryPosition(-1);
              setRedoLevel(0);
              setSnapshots([]);
              console.log('Form submitted, history and snapshots cleared');
              
              // Re-initialize history with the current state (if form is still displayed)
              setTimeout(() => {
                if (formFields) {
                  setHistory([JSON.stringify(formFields)]);
                  setHistoryPosition(0);
                  setRedoLevel(0);
                }
              }, 100);
            }}
            className="main-form"
          >
            <Dropzone
              id="dropzone"
              type="main"
              className="dropzone js-main-dropzone js-dropzone"
              onDrop={handleDropzoneEvent}
            >
              {formFields?.map((field, index) => (
                <FormField
                  key={`${field.id || field.name}-${index}`}
                  field={field}
                  draggable
                  index={index}
                  onFieldUpdate={(updatedField) => handleFieldUpdate(updatedField)}
                  onFieldDuplicate={(fieldToDuplicate) => {
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
                    setFormFields(prevFields => {
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
                  }}
                  onFieldDelete={(fieldToDelete) => {
                    console.log('Deleting field', {
                      id: fieldToDelete.id,
                      index: index,
                      clickedField: fieldToDelete
                    });

                    // Use the index parameter directly from the map function
                    // This ensures we delete exactly the item that was clicked
                    setFormFields(prevFields => {
                      // Safety check - make sure index is valid
                      if (index < 0 || index >= prevFields.length) {
                        console.error('Invalid index for deletion:', index);
                        return prevFields;
                      }

                      // Log the field we're about to delete to verify it's correct
                      console.log('About to delete field at index', index,
                        'name:', prevFields[index].name,
                        'id:', prevFields[index].id);

                      // Create a new array without the field at the current index
                      const newFields = [
                        ...prevFields.slice(0, index),
                        ...prevFields.slice(index + 1)
                      ];
                      
                      // Add to history after update
                      setTimeout(() => {
                        if (addHistoryEntry) {
                          addHistoryEntry(newFields);
                        }
                      }, 0);

                      return newFields;
                    });
                  }}
                />
              ))}
            </Dropzone>
            <div className="button-wrapper">
              <button type="submit" id="submit-primary" className="btn primary">
                Submit
              </button>
              <button className="btn" id="clear-dropzone" onClick={handleClearDropzone}>
                Clear Dropzone
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default EditSpace;
