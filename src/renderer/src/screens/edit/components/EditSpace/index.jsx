import React from 'react';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import { GhostElement } from '@lib/drag-drop/GhostElement';
import { EditProvider } from '../../context/EditContext';
import { HistoryProvider } from '../../context/HistoryContext';
import { SnapshotProvider } from '../../context/SnapshotContext';
import { FileHeader } from './components/FileHeader';
import { ContentForm } from './components/ContentForm';
import { useEditorSetup } from '../../hooks/useEditorSetup';
import { useContentProcessor } from '../../hooks/useContentProcessor';

// Import editor styles
import 'easymde/dist/easymde.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles.css';

/**
 * Content component that uses the hooks for setup and content processing
 * 
 * @param {Object} props Component props
 * @param {Object} props.fileContent The file content to edit
 * @returns {JSX.Element} The content component
 */
const EditSpaceContent = ({ fileContent }) => {
  // Setup editor on component mount
  useEditorSetup();
  
  // Process content when fileContent changes
  useContentProcessor(fileContent);
  
  return (
    <>
      <FileHeader />
      <div id="content-container">
        {fileContent && <ContentForm />}
      </div>
    </>
  );
};

/**
 * Main editing space component that handles file content processing and form rendering
 * 
 * @param {Object} props Component props
 * @param {boolean} props.$expanded Whether the edit space is in expanded mode
 * @param {Object} props.fileContent The content of the file being edited
 * @returns {JSX.Element} The edit space component
 */
const EditSpace = ({ fileContent, $expanded }) => {
  return (
    <main className={`edit-container container-background ${$expanded ? 'expanded' : ''}`}>
      <DragStateProvider>
        <GhostElement />
        <EditProvider>
          <HistoryProvider>
            <SnapshotProvider>
              <EditSpaceContent fileContent={fileContent} />
            </SnapshotProvider>
          </HistoryProvider>
        </EditProvider>
      </DragStateProvider>
    </main>
  );
};

export default EditSpace;
