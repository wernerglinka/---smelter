import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StorageOperations } from '../../services/storage';
import { selectFolder } from '../lib/select-folder';
import getFolderName from '../lib/utilities/get-folder-name';
import { TitleBar } from '../../styles/common';
import {
  NewProjectContainer,
  FolderSelectionArea,
  MessageContainer,
  ProjectFolderDisplay,
  FolderPath,
  ButtonContainer
} from './styles';

export default function NewProject() {
  const [contentPath, setContentPath] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [projectFolder, setProjectFolder] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const folder = StorageOperations.getProjectPath();
    if (folder) {
      const folderName = `/${folder.split('/').pop()}/`;
      setProjectFolder(folderName);
    }
  }, []);

  const formatFolderPath = (path) => {
    if (!path) return '';
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) return '';

    // Get just the project folder name
    const projectName = projectPath.split('/').pop();

    // Log for debugging
    console.log({
      projectPath,
      projectName,
      path,
      result: getFolderName(projectName, path)
    });

    return getFolderName(projectName, path);
  };

  const handleSelectFolder = async (type) => {
    try {
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
        message: `Error selecting ${type} folder`,
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
    <NewProjectContainer>
      <TitleBar />
      <h1>Metallurgy</h1>
      <p>Define a New Project</p>

      <MessageContainer>
        <p>
          To start working on a new project we need the paths to the content folder which contains
          the markdown content and the data folder which contains metadata files that are being used
          to build pages.
        </p>
      </MessageContainer>

      <ProjectFolderDisplay>
        <strong>Project folder : </strong>
        <span>{projectFolder}</span>
      </ProjectFolderDisplay>

      <FolderSelectionArea>
        <div>
          {!contentPath ? (
            <button onClick={() => handleSelectFolder('Content')}>
              Select Content Folder
            </button>
          ) : (
            <FolderPath>
              <strong>Content folder : </strong>
              <span>{formatFolderPath(contentPath)}</span>
            </FolderPath>
          )}
        </div>
        <div>
          {!dataPath ? (
            <button onClick={() => handleSelectFolder('Data')}>
              Select Data Folder
            </button>
          ) : (
            <FolderPath>
              <strong>Data folder : </strong>
              <span>{formatFolderPath(dataPath)}</span>
            </FolderPath>
          )}
        </div>
      </FolderSelectionArea>

      <ButtonContainer>
        <button
          onClick={handleStartProject}
          disabled={!contentPath || !dataPath}
        >
          Start Project
        </button>
        <Link to="/" className="btn">
          Cancel
        </Link>
      </ButtonContainer>
    </NewProjectContainer>
  );
}

