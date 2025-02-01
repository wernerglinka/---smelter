// lib/form-submission/submit-handler.js
import { validateSubmission } from './validate.js';
import { handleFileOperations } from './file-operations.js';
import { preprocessFormData } from './preprocess-form-data.js';
import { updateGitStatus } from '../../edit-project/sections/git-controls.js';

/**
 * Main form submission handler
 * @param {HTMLFormElement} form - The form element
 * @param {string} filePath - Path to save the file
 * @param {Object} schema - Form schema
 */
export const handleFormSubmission = async ( form, filePath, schema = null ) => {
  const submitButton = form.querySelector( 'button[type="submit"]' );
  submitButton.disabled = true;

  try {
    // Process form data
    const formData = preprocessFormData();

    if ( !formData ) {
      throw new Error( 'No form data available' );
    }

    // Always validate, but with optional schema
    const validationErrors = validateSubmission( formData, schema );
    if ( validationErrors.length ) {
      throw new Error( `Validation failed:\n${ validationErrors.join( '\n' ) }` );
    }

    // Handle file operations
    const cleanPath = filePath.replace( 'file://', '' );
    await handleFileOperations( formData, cleanPath );

    // Update git status after successful file operation
    updateGitStatus();

    return { success: true };

  } catch ( error ) {
    console.error( 'Form submission failed:', error );
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };

  } finally {
    submitButton.disabled = false;
  }
};