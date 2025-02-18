import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon } from '@components/icons';
import './styles.css';

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
  const handleDropzoneEvent = useCallback(async ({ type, data, position }) => {
    if (!data) {
      console.warn('Drop event received without data');
      return;
    }

    switch (type) {
      case 'templates': {
        try {
          // Process template data and add to form fields
          const templateData = await processTemplate(data);
          setFormFields(prevFields => {
            if (!prevFields) return [templateData];
            return [...prevFields, templateData];
          });
        } catch (error) {
          console.error('Error processing template:', error);
        }
        break;
      }

      case 'sidebar': {
        try {
          // Ensure we're working with the field data, not the wrapper
          const fieldData = data.field || data;

          // Validate field data
          if (!fieldData.type || !fieldData.name) {
            console.warn('Invalid field data received:', fieldData);
            return;
          }

          // Add new field at the specified position or at the end
          setFormFields(prevFields => {
            const newFields = prevFields ? [...prevFields] : [];
            if (typeof position === 'number' && position >= 0) {
              newFields.splice(position, 0, fieldData);
            } else {
              newFields.push(fieldData);
            }
            return newFields;
          });
        } catch (error) {
          console.error('Error processing field data:', error);
        }
        break;
      }

      case 'reorder': {
        try {
          const { sourceIndex, targetIndex } = position;
          if (typeof sourceIndex !== 'number' || typeof targetIndex !== 'number') {
            console.warn('Invalid reorder position data:', position);
            return;
          }

          setFormFields(prevFields => {
            const newFields = [...prevFields];
            const [movedField] = newFields.splice(sourceIndex, 1);
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
    <DragStateProvider>
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
                <button
                  type="submit"
                  id="submit-primary"
                  className="btn primary"
                >
                  Submit
                </button>
                <button
                  className="btn"
                  id="clear-dropzone"
                  onClick={handleClearDropzone}
                >
                  Clear Dropzone
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </DragStateProvider>
  );
};

export default EditSpace;
