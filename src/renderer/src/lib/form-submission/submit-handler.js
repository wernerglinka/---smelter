// lib/form-submission/submit-handler.js
import { validateSubmission } from './validate.js';
import { preprocessFormData } from './preprocess-form-data.js';
import { logger } from '@utils/services/logger';

/**
 * Main form submission handler
 * Uses improved error handling and async management
 * 
 * @param {Object} options - Submission options
 * @param {HTMLFormElement|FormData} options.form - The form element or FormData
 * @param {string} options.filePath - Path to save the file
 * @param {Object} [options.schema] - Optional form schema for validation
 * @returns {Promise<Object>} - Success status and data or error
 */
export const handleFormSubmission = async ({ form, filePath, schema = null }) => {
  // Validate inputs
  if (!form) {
    throw new Error('Form is required');
  }
  
  if (!filePath) {
    throw new Error('File path is required');
  }

  try {
    logger.info('Starting form submission process');
    
    // Process form data - handle both FormData and HTMLFormElement
    let formData;
    if (form instanceof FormData) {
      formData = preprocessFormData(null, form);
    } else if (form instanceof HTMLFormElement) {
      formData = preprocessFormData(form);
    } else {
      throw new Error('Invalid form provided - must be FormData or HTMLFormElement');
    }

    if (!formData) {
      throw new Error('No form data available');
    }

    logger.debug('Form data processed successfully', { fields: Object.keys(formData) });

    // Always validate, but with optional schema
    const validationErrors = validateSubmission(formData, schema);
    if (validationErrors.length) {
      logger.warn('Form validation failed', { errors: validationErrors });
      throw new Error(`Validation failed:\n${validationErrors.join('\n')}`);
    }

    // Handle file operations
    const cleanPath = filePath.replace('file://', '');

    // Extract and check if contents exists and has content
    let { contents, ...frontmatterData } = formData;
    const hasContent = contents && contents.trim() !== '';
    let result;

    // Use the appropriate method based on whether we have content
    if (hasContent) {
      logger.debug('Saving markdown with frontmatter and content');
      // Use writeObject that can handle both frontmatter and content
      result = await window.electronAPI.markdown.writeObject({
        path: cleanPath,
        obj: frontmatterData, // Contents is passed separately, not in frontmatter
        content: contents
      });
    } else {
      logger.debug('Saving frontmatter only (no content)');
      // No content or empty content - don't include contents field at all
      // If contents exists but is empty, delete it from the data
      if ('contents' in formData) {
        delete frontmatterData.contents; // Ensure it's removed from frontmatterData too
      }

      // Use regular writeYAML without the contents field
      result = await window.electronAPI.files.writeYAML({
        obj: frontmatterData,
        path: cleanPath
      });
    }

    if (result.status === 'failure') {
      throw new Error(`Failed to save file: ${result.error}`);
    }

    logger.info('File saved successfully', { path: cleanPath });

    // Add success notification
    await window.electronAPI.dialog.showCustomMessage({
      type: 'info',
      message: 'File saved successfully',
      buttons: ['OK']
    });

    return { 
      success: true,
      data: {
        path: cleanPath,
        frontmatter: frontmatterData,
        hasContent
      }
    };
  } catch (error) {
    logger.error('Form submission failed', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};
