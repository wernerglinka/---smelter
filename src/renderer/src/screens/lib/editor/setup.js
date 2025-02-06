import EasyMDE from 'easymde';

/**
 * Initializes EasyMDE editor
 * @returns {Object} EasyMDE instance
 */
export const initializeEditor = () => {
  const editorOverlay = createEditorOverlay();
  const editor = new EasyMDE({
    element: editorOverlay.querySelector('#editorWrapper'),
    autoDownloadFontAwesome: true
  });

  addEditorControls(editor, editorOverlay);
  return editor;
};

const createEditorOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'editorOverlay';

  const textarea = document.createElement('textarea');
  textarea.id = 'editorWrapper';

  overlay.appendChild(textarea);
  document.body.appendChild(overlay);

  return overlay;
};

const addEditorControls = (editor, overlay) => {
  const toolbar = document.querySelector('.editor-toolbar');

  // Add inline styles toggle
  const styleToggle = document.createElement('button');
  styleToggle.id = 'disableMarkdownStyles';
  styleToggle.innerHTML = 'Inline Styles';
  styleToggle.addEventListener('click', toggleMarkdownStyles);
  toolbar.appendChild(styleToggle);

  // Add close button
  const closeButton = document.createElement('div');
  closeButton.id = 'closeEditor';
  closeButton.innerHTML = 'close';
  closeButton.addEventListener('click', () => {
    const textareaInput = window.textareaInput;
    textareaInput.value = editor.value();
    overlay.classList.remove('show');
  });
  overlay.appendChild(closeButton);
};

const toggleMarkdownStyles = (event) => {
  event.target.classList.toggle('disabled');
  document.querySelector('.CodeMirror').classList.toggle('disable-markdown-styles');
};
