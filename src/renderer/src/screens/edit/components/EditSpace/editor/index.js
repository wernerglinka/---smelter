import { initializeEditor } from './initializeEditor';
import { setupEditorOverlay } from './setupOverlay';
import { setupEditorStyles } from './styles';
import { handleTextareaClick } from './eventHandlers';

/**
 * Creates and manages the EasyMDE editor integration
 * @returns {Object} Editor management functions and cleanup
 */
export const setupEditor = () => {
  // Create the editor overlay in the DOM
  setupEditorOverlay();

  // Add editor styles to the document
  const cleanupStyles = setupEditorStyles();

  // Set up click handler for textareas
  const cleanupClickHandler = handleTextareaClick(initializeEditor);

  // Return cleanup function
  return () => {
    cleanupClickHandler();
    cleanupStyles();

    // Remove overlay if it exists
    const overlay = document.getElementById('editorOverlay');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  };
};

// Export individual functions for direct access if needed
export { initializeEditor } from './initializeEditor';
