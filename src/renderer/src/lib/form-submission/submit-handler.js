// lib/form-submission/submit-handler.js
import { validateSubmission } from './validate.js';
import { preprocessFormData } from './preprocess-form-data.js';

/**
 * Main form submission handler
 * @param {HTMLFormElement} form - The form element
 * @param {string} filePath - Path to save the file
 * @param {Object} schema - Form schema
 */
export const handleFormSubmission = async (form, filePath, schema = null) => {
  // Make sure we have a valid form element
  if (!form || !(form instanceof HTMLFormElement)) {
    throw new Error('Invalid form element provided');
  }

  try {
    // Process form data
    const formData = preprocessFormData(form);

    if (!formData) {
      throw new Error('No form data available');
    }

    // Always validate, but with optional schema
    const validationErrors = validateSubmission(formData, schema);
    if (validationErrors.length) {
      throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
    }

    // Handle file operations
    const cleanPath = filePath.replace('file://', '');
    const result = await window.electronAPI.files.writeYAML({
      obj: formData,
      path: cleanPath
    });

    if (result.status === 'failure') {
      throw new Error(`Failed to save file: ${result.error}`);
    }

    // Add success notification
    await window.electronAPI.dialog.showCustomMessage({
      type: 'info',
      message: 'File saved successfully',
      buttons: ['OK']
    });

    return { success: true };
  } catch (error) {
    console.error('Form submission failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};
