import { createRoot } from 'react-dom/client';
import React from 'react';
import { CloseIcon } from '@components/icons';

/**
 * Creates the editor overlay elements in the DOM
 * This is called once when the component mounts
 */
export const setupEditorOverlay = () => {
  if (!document.getElementById('editorOverlay')) {
    // Create main overlay container
    const overlay = document.createElement('div');
    overlay.id = 'editorOverlay';

    // Create editor container
    const editorContainer = document.createElement('div');
    editorContainer.id = 'editorContainer';

    // Create textarea for EasyMDE
    const textarea = document.createElement('textarea');
    textarea.id = 'editorWrapper';

    // Assemble the DOM structure
    editorContainer.appendChild(textarea);
    overlay.appendChild(editorContainer);

    // Add close button
    const closeButton = document.createElement('div');
    closeButton.innerHTML = 'X';
    closeButton.id = 'closeEditor';
    overlay.appendChild(closeButton);

    // Add to document
    document.body.appendChild(overlay);
  }
};
