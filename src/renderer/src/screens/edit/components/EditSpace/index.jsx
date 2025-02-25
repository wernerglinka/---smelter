import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { processFrontmatter } from '@lib/form-generation/processors/frontmatter-processor';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon } from '@components/icons';
import { FIELD_TYPES } from '@lib/form-generation/schema/field-types';
import EasyMDE from 'easymde';
// Import the CSS directly from node_modules
import 'easymde/dist/easymde.min.css';
// Import Font Awesome from npm
import '@fortawesome/fontawesome-free/css/all.min.css';

import './styles.css';

// Icons for editor controls
const ICONS = {
  CLOSE: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>'
};

const createFieldFromTemplate = (template) => {
  if (!template || typeof template !== 'object') {
    throw new Error('Invalid template: must be an object');
  }

  const type = (template.type || 'text').toUpperCase();
  const fieldType = FIELD_TYPES[type];

  if (!fieldType) {
    throw new Error(`Invalid field type: ${type}`);
  }

  return {
    ...template,
    id: `field-${Date.now()}`,
    type: fieldType.type,
    value: template.value || fieldType.default
  };
};

/**
 * Main editing space component that handles file content processing and form rendering
 * @param {Object} props Component props
 * @param {boolean} props.$expanded Whether the edit space is in expanded mode
 * @param {Object} props.fileContent The content of the file being edited
 */
const EditSpace = ({ fileContent, $expanded }) => {
  const formRef = useRef(null);
  const [formFields, setFormFields] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [activeTextarea, setActiveTextarea] = useState(null);
  const editorRef = useRef(null);

  // Create editor overlay once when component mounts
  useEffect(() => {
    if (!document.getElementById('editorOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'editorOverlay';

      const editorContainer = document.createElement('div');
      editorContainer.id = 'editorContainer';

      const textarea = document.createElement('textarea');
      textarea.id = 'editorWrapper';

      editorContainer.appendChild(textarea);
      overlay.appendChild(editorContainer);
      document.body.appendChild(overlay);

      // Add close button
      const closeButton = document.createElement('div');
      closeButton.id = 'closeEditor';
      closeButton.innerHTML = ICONS.CLOSE;
      overlay.appendChild(closeButton);
    }
  }, []);

  // Initialize editor when needed
  const initializeEditor = useCallback((textareaContent) => {
    const editorOverlay = document.getElementById('editorOverlay');
    const editorElement = document.getElementById('editorWrapper');

    if (!editorElement) {
      console.error('Editor element not found');
      return null;
    }

    // Create new editor instance
    const editor = new EasyMDE({
      element: editorElement,
      autoDownloadFontAwesome: false, // Use our imported Font Awesome
      spellChecker: false, // Disable spell checker to avoid CSP issues
      toolbar: [
        'bold', 'italic', 'heading', '|',
        'quote', 'unordered-list', 'ordered-list', '|',
        'link', 'image', '|',
        'preview', 'side-by-side', 'fullscreen', '|',
        'guide'
      ]
    });

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
      });
    }

    // Show overlay
    editorOverlay.classList.add('show');

    return editor;
  }, []);

  // Add CSS for the editor overlay
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      #editorOverlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.95);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }

      #editorOverlay.show {
        opacity: 1;
        visibility: visible;
      }

      #editorContainer {
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
      }

      #editorWrapper {
        width: 100%;
        height: 100%;
        flex: 1;
      }

      #closeEditor {
        position: absolute;
        top: 20px;
        right: 20px;
        color: #333;
        cursor: pointer;
      }

      #disableMarkdownStyles {
        background: #f0f0f0;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
      }

      #disableMarkdownStyles.disabled {
        background: #ccc;
      }

      .disable-markdown-styles .cm-header,
      .disable-markdown-styles .cm-strong,
      .disable-markdown-styles .cm-em {
        font-weight: normal !important;
        font-style: normal !important;
        font-size: inherit !important;
      }

      /* Make editor take full height of container */
      .EasyMDEContainer, .CodeMirror {
        height: 100% !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle textarea clicks to open the editor
  useEffect(() => {
    const handleTextareaClick = (e) => {
      if (e.target.tagName === 'TEXTAREA') {
        window.textareaInput = e.target;
        initializeEditor(e.target.value);
      }
    };

    document.addEventListener('click', handleTextareaClick);

    return () => {
      document.removeEventListener('click', handleTextareaClick);
    };
  }, [initializeEditor]);

  // Process content when fileContent changes
  useEffect(() => {
    const processContent = async () => {
      if (fileContent?.data?.frontmatter) {
        const processedData = await processFrontmatter(
          fileContent.data.frontmatter,
          fileContent.data.content
        );
        setFormFields(processedData.fields);
        setActiveFilePath(fileContent.path);
        setFileName(fileContent.path.split('/').pop());
      }
    };

    processContent();
  }, [fileContent]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Remove overlay if it exists
      const overlay = document.getElementById('editorOverlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    };
  }, []);

  // Dropzone event handler
  const handleDropzoneEvent = useCallback(({ type, data, position }) => {
    if (!data) return;

    switch (type) {
      case 'sidebar': {
        try {
          setFormFields(prevFields => {
            const fieldType = data.type;
            const fieldConfig = FIELD_TYPES[fieldType.toUpperCase()];

            if (!fieldConfig) {
              console.warn(`No configuration found for field type: ${fieldType}`);
              return prevFields;
            }

            const newField = {
              ...fieldConfig,
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: fieldType,
              label: '',
              name: `field-${Date.now()}`, // Add name attribute for form submission
              value: ''
            };

            // Insert at position or append
            if (position && typeof position.targetIndex === 'number') {
              const newFields = [...prevFields];
              newFields.splice(position.targetIndex, 0, newField);
              return newFields;
            }
            return [...prevFields, newField];
          });
        } catch (error) {
          console.error('Error adding field:', error);
        }
        break;
      }
      case 'reorder': {
        try {
          setFormFields(prevFields => {
            const sourceIndex = prevFields.findIndex(field => field.id === data.id);
            if (sourceIndex === -1) return prevFields;

            const newFields = [...prevFields];
            const [movedField] = newFields.splice(sourceIndex, 1);
            newFields.splice(position.targetIndex, 0, movedField);
            return newFields;
          });
        } catch (error) {
          console.error('Error reordering fields:', error);
        }
        break;
      }
    }
  }, []);

  const handleClearDropzone = useCallback((e) => {
    e.preventDefault();
    setFormFields([]);
  }, []);

  return (
    <main className={`edit-container container-background ${$expanded ? 'expanded' : ''}`}>
      <h2 id="file-name">
        {fileName}
        <span id="preview-button" className="btn" role="button" title="Open preview pane">
          <PreviewShowIcon />
        </span>
      </h2>
      <div id="content-container">
        {fileContent && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmission(formRef.current, activeFilePath);
            }}
            className="main-form"
          >
            <Dropzone
              id="dropzone"
              type="main"
              className="dropzone js-main-dropzone js-dropzone"
              onDrop={handleDropzoneEvent}
            >
              {formFields?.map((field, index) => (
                <FormField
                  key={`${field.id || field.name}-${index}`}
                  field={field}
                  draggable
                  index={index}
                />
              ))}
            </Dropzone>
            <div className="button-wrapper">
              <button type="submit" id="submit-primary" className="btn primary">
                Submit
              </button>
              <button className="btn" id="clear-dropzone" onClick={handleClearDropzone}>
                Clear Dropzone
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
};

export default EditSpace;
