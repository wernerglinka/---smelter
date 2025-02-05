import React, { useEffect, useState } from 'react';
import { useProject } from '../../../../hooks/useProject';
import { PreviewShowIcon } from '../../../../components/icons';

const EditSpace = () => {
  const [ fileName, setFileName ] = useState( 'fileName' );
  const { projectPath } = useProject();

  useEffect(() => {
    if (!projectPath) return;

    const setupEditSpace = async () => {
      try {
        setFileName("filename");
        // Load directory files
        // Setup folder toggles
        // Setup file selection handlers
        // Setup template links
        // Initialize new page process
      } catch (error) {
        console.error('Failed to setup edit space:', error);
      }
    };

    setupEditSpace();
  }, [projectPath]);

  return (
    <div className="edit-container">
      <h2 id="file-name">
          <span>{fileName}</span>
        <button
          id="preview-button"
          className="btn"
          title="Open preview pane"
        >
          <PreviewShowIcon />
        </button>
      </h2>
      <div id="content-container"></div>
    </div>
  );
};

export default EditSpace;
