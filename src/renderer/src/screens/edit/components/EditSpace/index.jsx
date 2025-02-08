import { useState, useEffect, useContext } from 'react';
import { FormProvider, FormContext } from '@formsContext/FormContext';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter, processJsonData } from '@lib/form-generation/processors';
import { StorageOperations } from '@services/storage';
import './styles.css';

/**
 * Renders the form content using fields from FormContext
 * @returns {JSX.Element} Form with mapped field components
 */
const FormContent = () => {
  // Access the current state from FormContext
  const { state } = useContext(FormContext);

  return (
    <form id="main-form" className="main-form">
      <div id="dropzone" className="dropzone">
        {/* Map through fields array to render individual form fields */}
        {state.fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            implicitDef={field.implicitDef}
          />
        ))}
      </div>
    </form>
  );
};

/**
 * Main editing space component that handles file content processing and form rendering
 * @param {Object} props Component props
 * @param {boolean} props.$expanded Whether the edit space is in expanded mode
 * @param {Object} props.fileContent The content of the file being edited
 */
const EditSpace = ({ $expanded = false, fileContent }) => {
  // State to store processed form data
  const [formData, setFormData] = useState(null);

  /**
   * Converts absolute file path to relative path based on project root
   * @param {string} fullPath The absolute file path
   * @returns {string} The relative path from project root
   */
  const getRelativePath = (fullPath) => {
    const projectPath = StorageOperations.getProjectPath();

    console.log( `projectPath: ${projectPath}` );

    console.log( `fullPath: ${fullPath}` );


    if ( projectPath && fullPath.startsWith( projectPath ) ) {
      const relativePath = fullPath.substring( projectPath.length );

      console.log( relativePath );
      return relativePath;
    }
    return fullPath;
  };

  useEffect(() => {
    /**
     * Processes the file content based on its type (markdown or json)
     * and updates the form data state
     */
    const processData = async () => {
      try {
        let processedData;

        // Process content based on file type using optional chaining
        if (fileContent?.type === 'markdown') {
          processedData = await processFrontmatter(
            fileContent.data.frontmatter,
            fileContent.data.content
          );
        } else if (fileContent?.type === 'json') {
          processedData = processJsonData(fileContent.data);
        }

        console.log('Processed form data:', processedData);
        setFormData(processedData);
      } catch (error) {
        console.error('Error processing form data:', error);
      }
    };

    // Only process data if fileContent exists
    if (fileContent) {
      processData();
    }
  }, [fileContent]); // Re-run effect when fileContent changes

  // Early return if no file is selected
  if (!fileContent) {
    return <div>Select a file to edit</div>;
  }

  // Early return while processing data
  if (!formData) {
    return <div>Processing form data...</div>;
  }

  return (
    <div className={`edit-space ${$expanded ? 'expanded' : ''}`}>
      <div className="edit-space-header">
        <h2 className="filename">{getRelativePath(fileContent.path)}</h2>
      </div>
      <FormProvider initialData={formData}>
        <FormContent />
      </FormProvider>
    </div>
  );
};

export default EditSpace;
