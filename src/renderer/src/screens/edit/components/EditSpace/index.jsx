import React, { useEffect } from 'react';
import { FormProvider } from '@formsContext/FormContext';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors';
import './styles.css';

const EditSpace = ({ $expanded = false, fileContent }) => {
  const [formData, setFormData] = React.useState(null);

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
