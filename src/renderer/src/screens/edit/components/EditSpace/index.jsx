import { useRef, useEffect, useState, useCallback } from 'react';
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
const EditSpace = ({ fileContent }) => {
  const formRef = useRef(null);
  const [ formFields, setFormFields ] = useState( null );
  const [ activeFilePath, setActiveFilePath ] = useState( null );
  const [ fileName, setFileName ] = useState( null );

  useEffect(() => {
    const processContent = async () => {
      if (fileContent?.data?.frontmatter) {
        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content
        );
        setFormFields( processedData.fields );

        // set active file path
        const path = fileContent.path;
        setActiveFilePath( path );

        // get file name from path
        const fileName = path.split('/').pop();
        setFileName( fileName );
      }
    };

    processContent();
  }, [fileContent]);

  // Add drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dropzone-highlight');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropzone-highlight');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dropzone-highlight');

    try {
      const fieldData = JSON.parse(e.dataTransfer.getData('application/json'));

      // Add the new field to existing formFields
      setFormFields(prevFields => {
        if (!prevFields) return [fieldData];
        return [...prevFields, fieldData];
      });

    } catch (error) {
      console.error('Error processing dropped field:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const result = await handleFormSubmission(formData, activeFilePath);

    if (!result.success) {
      console.error('Form submission failed:', result.error);
    }
  };

  return (
    <main className="edit-container container-background">
      <h2 id="file-name">
       {fileName}
        <span id="preview-button" className="btn" role="button" title="Open preview pane">
          <PreviewShowIcon />
        </span>
      </h2>
      <div id="content-container">
        {fileContent && formFields && (
          <form ref={ formRef } onSubmit={ handleSubmit } className="main-form">
            <div
              id="dropzone"
              className="dropzone js-main-dropzone js-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formFields.map((field, i) => (
                <FormField
                  key={`${field.name}${i}`}
                  field={field}
                />
              ))}
              <div className="button-wrapper">
                <button type="submit" id="submit-primary" className="btn primary">Submit</button>
                <button className="btn" id="clear-dropzone">Clear Dropzone</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default EditSpace;

<div id="dropzone" className="dropzone js-main-dropzone js-dropzone"></div>
