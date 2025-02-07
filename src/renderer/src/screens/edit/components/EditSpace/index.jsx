import { useState, useEffect } from 'react';
import { FormProvider } from '@formsContext/FormContext';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter, processJsonData } from '@lib/form-generation/processors';
import { StorageOperations } from '@services/storage';
import './styles.css';

const EditSpace = ({ $expanded = false, fileContent }) => {
  const [formData, setFormData] = useState(null);

  const getRelativePath = (fullPath) => {
    const projectPath = StorageOperations.getProjectPath();
    if (projectPath && fullPath.startsWith(projectPath)) {
      const relativePath = fullPath.substring(projectPath.length);
      return relativePath;
    }
    return fullPath;
  };

  useEffect(() => {
    const processData = async () => {
      try {
        let processedData;

        if (fileContent?.type === 'markdown') {
          processedData = await processFrontmatter(
            fileContent.data.frontmatter,
            fileContent.data.content
          );
        } else if (fileContent?.type === 'json') {
          processedData = processJsonData(fileContent.data);
        }

        setFormData(processedData);
      } catch (error) {
        console.error('Error processing form data:', error);
        // TODO: Add error handling UI
      }
    };

    if (fileContent) {
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
