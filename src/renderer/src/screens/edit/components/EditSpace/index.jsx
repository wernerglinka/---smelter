import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon, RedoIcon, UndoIcon } from '@components/icons';
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
  const [formFields, setFormFields] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [fileName, setFileName] = useState(null);

  // Setup editor when component mounts
  useEffect(() => {
    const cleanupEditor = setupEditor();

    // Cleanup when component unmounts
    return cleanupEditor;
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
        // Then set the new fields after a short delay
        setTimeout(() => {
          setFormFields(processedData.fields);
          setActiveFilePath(fileContent.path);
          setFileName(fileContent.path.split('/').pop());
        }, 10);
      } else {
        // Reset form fields when no content is loaded
        setFormFields(null);
        setActiveFilePath(null);
        setFileName(null);
      }
    };

    processContent();
  }, [fileContent]);

  // Handle dropzone events (field addition, reordering)
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
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
  }, []);

  return (
    <main className={`edit-container container-background ${$expanded ? 'expanded' : ''}`}>
      <h2 id="file-name">
        {fileName}
        <span id="preview-button" className="btn" role="button" title="Open preview pane">
          <PreviewShowIcon />
        </span>
        <span id="undo-button" className="btn" role="button" title="undo last form change">
          <UndoIcon />
        </span>
        <span id="redo-button" className="btn" role="button" title="redo last form change">
          <RedoIcon />
        </span>
      </h2>
      <div id="content-container">
        {fileContent && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmission(formRef.current, activeFilePath);
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
