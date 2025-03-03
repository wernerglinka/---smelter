import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon } from '@components/icons';
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
          fileContent.data.content
        );
        setFormFields(processedData.fields);
        setActiveFilePath(fileContent.path);
        setFileName(fileContent.path.split('/').pop());
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
