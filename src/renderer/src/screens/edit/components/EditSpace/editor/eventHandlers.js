/**
 * Sets up the click handler for textareas to open the editor
 * @param {Function} initializeEditorFn - The function to initialize the editor
 * @returns {Function} Cleanup function to remove event listener
 */
export const handleTextareaClick = (initializeEditorFn) => {
  const clickHandler = (e) => {
    if (e.target.tagName === 'TEXTAREA') {
      // Check if the editor overlay is already visible
      const editorOverlay = document.getElementById('editorOverlay');
      if (editorOverlay && editorOverlay.classList.contains('show')) {
        // If the editor is already open, update the content with the new textarea
        window.textareaInput = e.target;
        initializeEditorFn(e.target.value);
      } else {
        // Otherwise, initialize a new editor
        window.textareaInput = e.target;
        initializeEditorFn(e.target.value);
      }
    }
  };

  document.addEventListener('click', clickHandler);

  // Return cleanup function
  return () => {
    document.removeEventListener('click', clickHandler);
  };
};
