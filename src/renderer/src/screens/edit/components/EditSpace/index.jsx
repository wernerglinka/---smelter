import { useState, useEffect } from 'react';
import { FormProvider } from '@formsContext/FormContext';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors';
import { StorageOperations } from '@services/storage';
import './styles.css';

const EditSpace = ({ $expanded = false, fileContent }) => {
  const [formData, setFormData] = useState(null);

  const getRelativePath = (fullPath) => {
    // Get project path from local storage
    const projectPath = StorageOperations.getProjectPath();
    if (projectPath && fullPath.startsWith(projectPath)) {
      // Remove the project path and get the relative path
      const relativePath = fullPath.substring(projectPath.length);
      return relativePath;
    }
    return fullPath; // Fallback to full path if something goes wrong
  };

  useEffect(() => {
    if (fileContent?.type === 'markdown') {
      const processData = async () => {
        try {
          const processedData = await processFrontmatter(
            fileContent.data.frontmatter,
            fileContent.data.content
          );
          setFormData(processedData);
        } catch (error) {
          console.error('Error processing form data:', error);
          // TODO: Add error handling UI
        }
      };
      processData();
    }
  }, [fileContent]);

  if (!fileContent) {
    return <div>Select a file to edit</div>;
  }

  if (!formData) {
    return <div>Processing form data...</div>;
  }

  return (
    <div className={`edit-space ${$expanded ? 'expanded' : ''}`}>
      <div className="edit-space-header">
        <h2 className="filename">{getRelativePath(fileContent.path)}</h2>
      </div>
      <FormProvider initialData={formData}>
        <form id="main-form" className="main-form">
          <div id="dropzone" className="dropzone">
            {formData.fields.map((field) => (
              <FormField
                key={`${field.id || field.label}`}
                field={field}
                implicitDef={field.implicitDef}
              />
            ))}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EditSpace;
