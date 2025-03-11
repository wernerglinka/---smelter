import React from 'react';
import { PreviewShowIcon } from '@components/icons';
import { UndoRedoControls } from './UndoRedoControls';
import { SnapshotControls } from './SnapshotControls';
import { useEdit } from '../../../context/EditContext';

/**
 * File header component displaying file name and edit controls
 * 
 * @returns {JSX.Element} The file header component
 */
export const FileHeader = () => {
  const { fileName } = useEdit();
  
  return (
    <h2 id="file-name">
      {fileName}
      <span id="preview-button" className="btn" role="button" title="Open preview pane">
        <PreviewShowIcon />
      </span>
      <div id="undo-redo-wrapper">
        <UndoRedoControls />
        <SnapshotControls />
      </div>
    </h2>
  );
};