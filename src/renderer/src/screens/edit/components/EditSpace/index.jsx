import React, { useEffect, useState } from 'react';
import { useProject } from '../../../../hooks/useProject';
import { PreviewShowIcon } from '../../../../components/icons';

const EditSpace = () => {
  const [fileName, setFileName] = useState('');
  const { projectPath } = useProject();

  /**
   * Retrieves project name from localStorage and updates DOM
   * @throws {Error} If project folder is not set
   * @returns {void}
   */
  const updateProjectName = () => {
    // Get and validate project folder
    const projectFolder = localStorage.getItem( 'projectFolder' );
    if ( !projectFolder ) {
      throw new Error( 'Project folder not set in localStorage' );
    }

    // Extract project name from path
    const projectName = projectFolder
      .split( '/' )
      .filter( Boolean ) // Remove empty segments
      .pop();

    if ( !projectName ) {
      throw new Error( 'Invalid project folder path' );
    }

    return projectName;
  };

  useEffect(() => {
    setFileName('Select a file to edit');
  }, []);

  useEffect(() => {
    const setupEditSpace = async () => {
      // TODO: need to get the selected file name from sidebar
      setFileName('Select a file to edit');
    };

    setupEditSpace();
  }, [projectPath]);

  return (
    <div className="edit-container">
      <h2 id="file-name">
        <span>{fileName}</span>
        <button id="preview-button" className="btn" title="Open preview pane">
          <PreviewShowIcon />
        </button>
      </h2>
      <div id="content-container"></div>
    </div>
  );
};

export default EditSpace;
