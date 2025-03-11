import { useRef, useEffect, useState, useCallback } from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import Dropzone from '@components/Dropzone';
import { FormField } from '@lib/form-generation/components/FormField';
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { PreviewShowIcon, RedoIcon, UndoIcon, SnapshotIcon } from '@components/icons';
import { FIELD_TYPES } from '@lib/form-generation/schema/field-types';
import { setupEditor } from './editor';
import 'easymde/dist/easymde.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import handlers from separate modules
import {
  handleFieldUpdate,
  handleFieldDuplicate,
  handleFieldDelete,
  handleDropzoneEvent,
  handleClearDropzone
} from './handlers/fieldHandlers';

import {
  addToHistory,
  addHistoryEntry,
  handleFormReset,
  handleUndo,
  handleRedo
} from './history/historyHandlers';

import { handleCreateSnapshot, handleRestoreSnapshot } from './history/snapshotHandlers';

import { processContent } from './handlers/contentHandlers';

import './styles.css';

/**
 * Creates a field object from a template
 * @param {Object} template - Field template
 * @returns {Object} Field object with type and default value
 */
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
 * Processes a template field
 * @param {string} key - Field key/name
 * @param {*} value - Field value
 * @param {string} parentId - Parent field ID for nesting
 * @returns {Object} Processed field
 */
const processTemplateField = (key, value, parentId = '') => {
  const fieldId = `field-${Date.now()}-${parentId}${key}`;

  if (value === null || value === undefined) {
    return {
      id: fieldId,
      name: key,
      type: 'TEXT',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      value: ''
    };
  }

  // Handle different types
  if (typeof value === 'object' && !Array.isArray(value)) {
    return {
      id: fieldId,
      name: key,
      type: 'OBJECT',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      fields: Object.entries(value).map(([k, v]) => processTemplateField(k, v, `${fieldId}-`))
    };
  }

  if (Array.isArray(value)) {
    return {
      id: fieldId,
      name: key,
      type: 'ARRAY',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      items: value.map((item, index) => processTemplateField(`${index}`, item, `${fieldId}-`))
    };
  }

  return {
    id: fieldId,
    name: key,
    type: typeof value === 'boolean' ? 'BOOLEAN' : 'TEXT',
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
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
  const [redoLevel, setRedoLevel] = useState(0);
  const lastUpdateTimeRef = useRef(0); // Track last update time to debounce history entries

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyPosition, setHistoryPosition] = useState(-1);
  const [snapshots, setSnapshots] = useState([]);
  const MAX_HISTORY = 10;

  // Memoized functions using the extracted handlers
  const memoizedAddToHistory = useCallback(
    (formState) => {
      addToHistory(
        formState,
        history,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
    },
    [history, historyPosition]
  );

  const memoizedAddHistoryEntry = useCallback(
    (formState) => {
      addHistoryEntry(
        formState,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
    },
    [historyPosition]
  );

  const memoizedHandleFormReset = useCallback((restoredState) => {
    handleFormReset(restoredState, formRef, setFormFields);
  }, []);

  const memoizedHandleUndo = useCallback(() => {
    handleUndo(history, historyPosition, setHistoryPosition, setRedoLevel, memoizedHandleFormReset);
  }, [history, historyPosition, memoizedHandleFormReset]);

  const memoizedHandleRedo = useCallback(() => {
    handleRedo(history, historyPosition, setHistoryPosition, setRedoLevel, memoizedHandleFormReset);
  }, [history, historyPosition, memoizedHandleFormReset]);

  const memoizedHandleCreateSnapshot = useCallback(() => {
    handleCreateSnapshot(formFields, snapshots, setSnapshots);
  }, [formFields, snapshots]);

  const memoizedHandleRestoreSnapshot = useCallback(
    (index) => {
      handleRestoreSnapshot(
        index,
        snapshots,
        historyPosition,
        memoizedHandleFormReset,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
    },
    [snapshots, historyPosition, memoizedHandleFormReset]
  );

  const memoizedHandleFieldUpdate = useCallback(
    (updatedField, fieldPath = []) => {
      handleFieldUpdate(updatedField, fieldPath, setFormFields, memoizedAddHistoryEntry);
    },
    [memoizedAddHistoryEntry]
  );

  const memoizedHandleFieldDuplicate = useCallback(
    (fieldToDuplicate, index) => {
      return handleFieldDuplicate(fieldToDuplicate, index, setFormFields, memoizedAddHistoryEntry);
    },
    [memoizedAddHistoryEntry]
  );

  const memoizedHandleFieldDelete = useCallback(
    (fieldToDelete, index) => {
      return handleFieldDelete(fieldToDelete, index, setFormFields, memoizedAddHistoryEntry);
    },
    [memoizedAddHistoryEntry]
  );

  const memoizedHandleDropzoneEvent = useCallback(
    (event) => {
      handleDropzoneEvent(event, setFormFields, memoizedAddHistoryEntry, createFieldFromTemplate);
    },
    [memoizedAddHistoryEntry]
  );

  const memoizedHandleClearDropzone = useCallback(
    (e) => {
      handleClearDropzone(e, setFormFields, memoizedAddHistoryEntry);
    },
    [memoizedAddHistoryEntry]
  );

  // State to control snapshot list visibility
  const [showSnapshotList, setShowSnapshotList] = useState(false);

  // Setup editor when component mounts
  useEffect(() => {
    const cleanupEditor = setupEditor();

    // No need for click outside handler anymore since we're using hover behavior

    // Cleanup when component unmounts
    return () => {
      cleanupEditor();
    };
  }, []);

  // Process content when fileContent changes
  useEffect(() => {
    processContent(
      fileContent,
      setFormFields,
      setActiveFilePath,
      setFileName,
      setHistory,
      setHistoryPosition,
      setRedoLevel,
      setSnapshots
    );
  }, [fileContent]);

  return (
    <main className={`edit-container container-background ${$expanded ? 'expanded' : ''}`}>
      <h2 id="file-name">
        {fileName}
        <span id="preview-button" className="btn" role="button" title="Open preview pane">
          <PreviewShowIcon />
        </span>
        <div id="undo-redo-wrapper">
          <span
            className={`undo btn ${historyPosition <= 0 ? 'disabled' : ''}`}
            role="button"
            title="undo last form change"
            onClick={memoizedHandleUndo}
          >
            <UndoIcon />
          </span>
          <span className="undo-redo-count">{redoLevel}</span>
          <span
            className={`redo btn ${historyPosition >= history.length - 1 ? 'disabled' : ''}`}
            role="button"
            title="redo last form change"
            onClick={memoizedHandleRedo}
          >
            <RedoIcon />
          </span>
          <div className="snapshot-container">
            <span
              className="snapshot btn"
              role="button"
              title="take snapshot of form"
              onClick={() => {
                // Only create a new snapshot
                memoizedHandleCreateSnapshot();
              }}
              onMouseEnter={() => {
                // Show snapshot list on hover if we have snapshots
                if (snapshots.length > 0) {
                  setShowSnapshotList(true);
                }
              }}
            >
              <SnapshotIcon />
            </span>

            {snapshots.length > 0 && (
              <div
                className={`snapshot-list ${showSnapshotList ? 'visible' : ''}`}
                onMouseLeave={() => setShowSnapshotList(false)}
              >
                <div className="snapshot-list-header">Saved Snapshots</div>
                {snapshots.map((snapshot, index) => (
                  <div
                    key={snapshot.timestamp}
                    className="snapshot-item"
                    onClick={(e) => {
                      e.stopPropagation();

                      // Show restoration message
                      const messageElement = document.createElement('div');
                      messageElement.className = 'snapshot-message';
                      messageElement.textContent = `Restoring: ${snapshot.name}`;
                      document.body.appendChild(messageElement);

                      // Remove message after 3 seconds
                      setTimeout(() => {
                        if (messageElement.parentNode) {
                          messageElement.parentNode.removeChild(messageElement);
                        }
                      }, 3000);

                      // Restore the snapshot
                      memoizedHandleRestoreSnapshot(index);
                      setShowSnapshotList(false);
                    }}
                  >
                    {snapshot.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </h2>
      <div id="content-container">
        {fileContent && (
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();

              // Submit the form with new object-based API
              handleFormSubmission({
                form: formRef.current,
                filePath: activeFilePath
              });

              // Reset history and snapshots after submission
              setHistory([]);
              setHistoryPosition(-1);
              setRedoLevel(0);
              setSnapshots([]);
              console.log('Form submitted, history and snapshots cleared');

              // Re-initialize history with the current state (if form is still displayed)
              setTimeout(() => {
                if (formFields) {
                  setHistory([JSON.stringify(formFields)]);
                  setHistoryPosition(0);
                  setRedoLevel(0);
                }
              }, 100);
            }}
            className="main-form"
          >
            <Dropzone
              id="dropzone"
              type="main"
              className="dropzone js-main-dropzone js-dropzone"
              onDrop={memoizedHandleDropzoneEvent}
            >
              {formFields?.map((field, index) => (
                <FormField
                  key={`${field.id || field.name}-${index}`}
                  field={field}
                  draggable
                  index={index}
                  onFieldUpdate={(updatedField) => memoizedHandleFieldUpdate(updatedField)}
                  onFieldDuplicate={(fieldToDuplicate) =>
                    memoizedHandleFieldDuplicate(fieldToDuplicate, index)
                  }
                  onFieldDelete={(fieldToDelete) => memoizedHandleFieldDelete(fieldToDelete, index)}
                />
              ))}
            </Dropzone>
            <div className="button-wrapper">
              <button type="submit" id="submit-primary" className="btn primary">
                Submit
              </button>
              <button className="btn" id="clear-dropzone" onClick={memoizedHandleClearDropzone}>
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
