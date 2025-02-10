import { useRef, useEffect, useState } from 'react';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';

/**
 * Main editing space component that handles file content processing and form rendering
 * @param {Object} props Component props
 * @param {boolean} props.$expanded Whether the edit space is in expanded mode
 * @param {Object} props.fileContent The content of the file being edited
 */
const EditSpace = ({ fileContent, filePath }) => {
  const formRef = useRef(null);
  const [formFields, setFormFields] = useState(null);

  useEffect(() => {
    const processContent = async () => {
      if (fileContent?.data?.frontmatter) {
        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content
        );
        setFormFields(processedData.fields);
      }
    };

    processContent();
  }, [fileContent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(formRef.current);
    const result = await handleFormSubmission(formData, filePath);

    if (!result.success) {
      console.error('Form submission failed:', result.error);
    }
  };

  if (!fileContent || !formFields) {
    return <div>Loading...</div>;
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} id="main-form">
      {formFields.map((field, i) => (
        <FormField
          key={`${field.name}${i}`}
          field={field}
        />
      ))}
      <button type="submit">Save</button>
    </form>
  );
};

export default EditSpace;
