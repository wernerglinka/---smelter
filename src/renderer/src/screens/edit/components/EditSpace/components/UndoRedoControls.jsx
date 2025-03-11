import React from 'react';
import { UndoIcon, RedoIcon } from '@components/icons';
import { useHistory } from '../../../context/HistoryContext';
import { useEdit } from '../../../context/EditContext';

/**
 * Undo and redo controls component
 * 
 * @returns {JSX.Element} The undo/redo controls component
 */
export const UndoRedoControls = () => {
  const { canUndo, canRedo, redoLevel, undo, redo } = useHistory();
  const { resetForm } = useEdit();
  
  const handleUndo = () => {
    if (canUndo) {
      undo(resetForm);
    }
  };
  
  const handleRedo = () => {
    if (canRedo) {
      redo(resetForm);
    }
  };
  
  return (
    <>
      <span
        className={`undo btn ${!canUndo ? 'disabled' : ''}`}
        role="button"
        title="undo last form change"
        onClick={handleUndo}
      >
        <UndoIcon />
      </span>
      <span className="undo-redo-count">{redoLevel}</span>
      <span
        className={`redo btn ${!canRedo ? 'disabled' : ''}`}
        role="button"
        title="redo last form change"
        onClick={handleRedo}
      >
        <RedoIcon />
      </span>
    </>
  );
};