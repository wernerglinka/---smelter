import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageOperations } from '../../services/storage';
import { selectFolder } from '../lib/utilities/select-folder';
import getFolderName from '../lib/utilities/get-folder-name';

import './styles.css';

export default function NewProject() {
  const [contentPath, setContentPath] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [projectFolder, setProjectFolder] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get and set project folder on component mount
    const folder = StorageOperations.getProjectPath();

    // If project folder exists, set it and clear other data as we don't know
    // if the content and data paths are valid. They might be leftovers from
    // a previous project.
    if (folder) {
      const folderName = `/${folder.split('/').pop()}/`;
      setProjectFolder(folderName);

      // Clear content and data paths only
      setContentPath('');
      setDataPath('');

      // Clear project data while preserving project path
      const projectPath = StorageOperations.getProjectPath();
      StorageOperations.clearProjectData();
      StorageOperations.saveProjectPath(projectPath);
    }
  }, []);

  const formatFolderPath = (path) => {
    if (!path) return '';
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) return '';

    return getFolderName(projectPath.split('/').pop(), path);
  };

  const handleSelectFolder = async (type) => {
    try {
      const projectPath = StorageOperations.getProjectPath();
      if (!projectPath) {
        throw new Error('Project folder not found in storage');
      }

      const userSelection = await selectFolder(type);
      if (!userSelection.length) return;

      const folderPath = userSelection[0];
      if (type === 'Content') {
        StorageOperations.saveContentPath(folderPath);
        setContentPath(folderPath);
      } else {
        StorageOperations.saveDataPath(folderPath);
        setDataPath(folderPath);
      }
    } catch (error) {
      console.error(`Error selecting ${type} folder:`, error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Error selecting ${type} folder: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  const handleStartProject = async () => {
    try {
      const projectPath = StorageOperations.getProjectPath();
      const projectData = {
        projectPath,
        contentPath,
        dataPath
      };

      const configFilePath = `${projectPath}/.metallurgy/projectData.json`;

      const response = await window.electronAPI.files.write({
        obj: projectData,
        path: configFilePath
      });

      if (response.status === 'success') {
        StorageOperations.saveProjectData(projectData);
        navigate('/edit');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error creating project config:', error);
      navigate('/');
    }
  };

  return (
    <main className="new-project">
      <div className="titlebar" />
      <h1>Smelter</h1>
      <p>Define a New Project</p>

      <div>
        <p className="start-new">
          To start working on a new project we need the paths to the content folder which contains
          the markdown content and the data folder which contains metadata files that are being used
          to build pages.
        </p>
        <p className="start-with-config">
          This project folder already has a configuration file. You can start working on it by
          clicking
          <strong>START PROJECT</strong>, or you can start a new project by clicking
          <strong>START OVER</strong>. Starting over will overwrite the existing configuration file.
        </p>

        <ul>
          <li>
            <strong>Project folder : </strong>
            <span className="folder-path">{projectFolder}</span>
          </li>
          <li className="get-path">
            {!contentPath ? (
              <button onClick={() => handleSelectFolder('Content')}>Select Content Folder</button>
            ) : (
              <div className="path-display">
                <strong>Content folder :</strong>
                <span>{formatFolderPath(contentPath)}</span>
              </div>
            )}
          </li>
          <li className="get-path">
            {!dataPath ? (
              <button onClick={() => handleSelectFolder('Data')}>Select Data Folder</button>
            ) : (
              <div className="path-display">
                <strong>Data folder : </strong>
                <span>{formatFolderPath(dataPath)}</span>
              </div>
            )}
          </li>
          <li class="decision-buttons">
            <button onClick={handleStartProject} disabled={!contentPath || !dataPath}>
              Start Project
            </button>
            <Link to="/" className="btn">
              Cancel
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
