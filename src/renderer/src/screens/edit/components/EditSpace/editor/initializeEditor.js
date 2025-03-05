import EasyMDE from 'easymde';

// Keep track of the current editor instance
let currentEditor = null;

/**
 * Initializes the EasyMDE editor with the provided content
 * @param {string} textareaContent - The content to load into the editor
 * @returns {EasyMDE|null} The editor instance or null if initialization failed
 */
export const initializeEditor = (textareaContent) => {
  const editorOverlay = document.getElementById('editorOverlay');
  const editorElement = document.getElementById('editorWrapper');

  if (!editorElement) {
    console.error('Editor element not found');
    return null;
  }

  // If there's already an editor instance, destroy it first
  if (currentEditor) {
    currentEditor.toTextArea();
    currentEditor = null;
  }

  // Create new editor instance
  const editor = new EasyMDE({
    element: editorElement,
    autoDownloadFontAwesome: false, // Use our imported Font Awesome
    spellChecker: false, // Disable spell checker to avoid CSP issues
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'image',
      '|',
      'preview',
      'side-by-side',
      'fullscreen',
      '|',
      'guide'
    ]
  });

  // Store the current editor instance
  currentEditor = editor;

  // Set editor value to textarea content
  editor.value(textareaContent);

  // Add editor controls
  const toolbar = document.querySelector('.editor-toolbar');

  // Add inline styles toggle if it doesn't exist
  if (toolbar && !document.getElementById('disableMarkdownStyles')) {
    const styleToggle = document.createElement('button');
    styleToggle.id = 'disableMarkdownStyles';
    styleToggle.innerHTML = 'Inline Styles';
    styleToggle.addEventListener('click', (event) => {
      event.target.classList.toggle('disabled');
      document.querySelector('.CodeMirror').classList.toggle('disable-markdown-styles');
    });
    toolbar.appendChild(styleToggle);
  }

  // Add close button event listener
  const closeButton = document.getElementById('closeEditor');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (window.textareaInput) {
        window.textareaInput.value = editor.value();

        // Trigger input event to update form state
        const event = new Event('input', { bubbles: true });
        window.textareaInput.dispatchEvent(event);
      }
      editorOverlay.classList.remove('show');

      // Remove the has-overlay class from body when closing
      document.body.classList.remove('has-overlay');
    });
  }

  // Show overlay
  editorOverlay.classList.add('show');

  // Add has-overlay class to body to prevent scrolling
  document.body.classList.add('has-overlay');

  return editor;
};
