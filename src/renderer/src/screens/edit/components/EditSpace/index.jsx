import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon } from '@components/icons';
import { FIELD_TYPES } from '@lib/form-generation/schema/field-types';
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

  // Process content when fileContent changes
  useEffect(() => {
    const processContent = async () => {
      if (fileContent?.data?.frontmatter) {

        // Add debugging to see the structure as json
        //console.log('Frontmatter as JSON:', JSON.stringify(fileContent.data.frontmatter, null, 2));

        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content
        );
        setFormFields(processedData.fields);

        // set active file path
        const path = fileContent.path;
        setActiveFilePath(path);

        // get file name from path
        const fileName = path.split('/').pop();
        setFileName(fileName);
      }
    };

    processContent();
  }, [fileContent]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const result = await handleFormSubmission(formData, activeFilePath);

    if (!result.success) {
      console.error('Form submission failed:', result.error);
    }
  };

  // Field update handler
  const handleFieldUpdate = useCallback((fieldId, newValue) => {
    setFormFields(prevFields => {
      return prevFields.map(field => {
        if (field.id === fieldId) {
          // For object fields, we need to preserve the entire field structure
          if (typeof newValue === 'object' && newValue !== null) {
            return { ...field, ...newValue };
          }
          // For primitive values
          return { ...field, value: newValue };
        }
        return field;
      });
    });
  }, []);

  // Dropzone event handler
  const handleDropzoneEvent = useCallback(({ type, data, position }) => {
    console.log('Dropzone event - type:', type, 'data:', data, 'position:', position);

    if (!data) return;

    switch (type) {
      case 'sidebar': {
        try {
          setFormFields(prevFields => {
            const fieldType = data.type;
            console.log('Creating field of type:', fieldType);

            const fieldConfig = FIELD_TYPES[fieldType.toUpperCase()];
            console.log('Field config:', fieldConfig);

            if (!fieldConfig) {
              console.warn(`No configuration found for field type: ${fieldType}`);
              return prevFields;
            }

            const newField = {
              ...fieldConfig,
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: fieldType,
              label: '',
              value: ''
            };
            console.log('Created new field:', newField);

            const newFields = [...prevFields];
            if (typeof position.targetIndex === 'number' && position.targetIndex >= 0) {
              newFields.splice(position.targetIndex, 0, newField);
            } else {
              newFields.push(newField);
            }

            return newFields;
          });
        } catch (error) {
          console.error('Failed to create field:', error);
        }
        break;
      }

      case 'dropzone': {
        try {
          setFormFields(prevFields => {
            const newFields = [...prevFields];
            const sourceIndex = newFields.findIndex(f => f.id === data.id);
            if (sourceIndex === -1) return prevFields;

            const [movedField] = newFields.splice(sourceIndex, 1);
            const targetIndex = typeof position.targetIndex === 'number' && position.targetIndex >= 0
              ? position.targetIndex
              : newFields.length;

            newFields.splice(targetIndex, 0, movedField);
            return newFields;
          });
        } catch (error) {
          console.error('Error reordering fields:', error);
        }
        break;
      }

      default:
        console.warn('Unhandled drop type:', type);
    }
  }, []);

  // Add handleClearDropzone function
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
      </h2>
      <div id="content-container">
        {fileContent && (
          <form ref={formRef} onSubmit={handleSubmit} className="main-form">
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
                  onUpdate={handleFieldUpdate}
                  draggable
                  index={index}
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
