import React, { useRef } from 'react';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { useEdit } from '../../../context/EditContext';
import { useHistory } from '../../../context/HistoryContext';
import { useSnapshots } from '../../../context/SnapshotContext';

/**
 * Form component for editing content
 * 
 * @returns {JSX.Element} The content form component
 */
export const ContentForm = () => {
  const formRef = useRef(null);
  const { 
    formFields, 
    activeFilePath, 
    updateField, 
    duplicateField, 
    deleteField, 
    handleDropEvent, 
    clearFields 
  } = useEdit();
  const { addHistoryEntry, resetHistory } = useHistory();
  const { resetSnapshots } = useSnapshots();
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Submit the form with new object-based API
    handleFormSubmission({
      form: formRef.current,
      filePath: activeFilePath
    });

    // Reset history and snapshots after submission
    resetHistory();
    resetSnapshots();
    console.log('Form submitted, history and snapshots cleared');

    // Re-initialize history with the current state (if form is still displayed)
    setTimeout(() => {
      if (formFields) {
        resetHistory(formFields);
      }
    }, 100);
  };
  
  const handleFieldUpdate = (updatedField) => {
    updateField(updatedField, [], addHistoryEntry);
  };
  
  const handleFieldDuplicate = (fieldToDuplicate, index) => {
    duplicateField(fieldToDuplicate, index, addHistoryEntry);
  };
  
  const handleFieldDelete = (fieldToDelete, index) => {
    deleteField(fieldToDelete, index, addHistoryEntry);
  };
  
  const handleDrop = (event) => {
    handleDropEvent(event, addHistoryEntry);
  };
  
  const handleClear = (e) => {
    clearFields(e, addHistoryEntry);
  };
  
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="main-form"
    >
      <Dropzone
        id="dropzone"
        type="main"
        className="dropzone js-main-dropzone js-dropzone"
        onDrop={handleDrop}
      >
        {formFields?.map((field, index) => (
          <FormField
            key={`${field.id || field.name}-${index}`}
            field={field}
            draggable
            index={index}
            onFieldUpdate={handleFieldUpdate}
            onFieldDuplicate={(fieldToDuplicate) =>
              handleFieldDuplicate(fieldToDuplicate, index)
            }
            onFieldDelete={(fieldToDelete) => 
              handleFieldDelete(fieldToDelete, index)
            }
          />
        ))}
      </Dropzone>
      <div className="button-wrapper">
        <button type="submit" id="submit-primary" className="btn primary">
          Submit
        </button>
        <button className="btn" id="clear-dropzone" onClick={handleClear}>
          Clear Dropzone
        </button>
      </div>
    </form>
  );
};