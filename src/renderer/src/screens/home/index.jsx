import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderPlusIcon,
  FolderOpenIcon,
  FolderMinusIcon,
  GithubIcon,
  DeleteIcon
} from '../../components/icons';
import { StorageOperations } from '@services/storage';
import { ProjectOperations } from '@services/project';
import { selectProject } from '../lib/utilities/select-project';
import { handleDeleteProject } from './handlers/delete-project';
import { handleEditProject } from './handlers/edit-project';
import { handleCloneGithub } from './handlers/clone-github';

import './styles.css';

/**
 * Home component - main landing page for the Metallurgy application
 * @returns {JSX.Element} The rendered component
 */
const App = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const projects = StorageOperations.getRecentProjects();
        const projectsWithNames = projects.map((project) => ({
          ...project,
          name: StorageOperations.getProjectName(project.projectPath)
        }));
        setRecentProjects(projectsWithNames);
      } catch (error) {
        console.error('Failed to load recent projects:', error);
      }
    };

    loadRecentProjects();
  }, []);

  const handleRecentProjectClick = async (projectData) => {
    try {
      // First verify the project still exists
      const exists = await window.electronAPI.directories.exists(projectData.projectPath);
      if (!exists.data) {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'Project folder no longer exists',
          buttons: ['OK']
        });
        // Remove from recent projects
        StorageOperations.removeFromRecentProjects(projectData.projectPath);
        // Refresh the list
        setRecentProjects(StorageOperations.getRecentProjects());
        return;
      }

      // Project exists, set it as current and navigate
      StorageOperations.setCurrentProject(projectData);
      navigate('/edit');
    } catch (error) {
      console.error('Error opening recent project:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to open project: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  /**
   * Handles initializing a new project
   * @param {React.MouseEvent} e - Click event
   */
  const handleNewProject = async (e) => {
    e.preventDefault();
    try {
      const projectFolder = await selectProject();

      if (projectFolder === 'abort') return;

      // Check if this is already a Metallurgy project
      const isValid = await ProjectOperations.validateProject(projectFolder);

      // Save project path without clearing other data
      StorageOperations.saveProjectPath(projectFolder);

      if (isValid) {
        // If it's a valid project, load config and go to edit screen
        const config = await ProjectOperations.loadProjectConfig(projectFolder);
        const projectData = {
          projectPath: projectFolder,
          contentPath: config.contentPath,
          dataPath: config.dataPath
        };
        StorageOperations.setCurrentProject(projectData); // This will also add to recent projects
        navigate('/edit');
      } else {
        // If it's not a valid project, just navigate to new project screen
        navigate('/new');
      }
    } catch (error) {
      console.error('Error initializing project:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to initialize project: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  const handleCloneClick = (e) => {
    handleCloneGithub(e, navigate);
  };

  const handleRemoveRecentProject = async (project) => {
    try {
      // Remove from recent projects in storage
      StorageOperations.removeFromRecentProjects(project.projectPath);

      // Update the UI with fresh data
      const updatedProjects = StorageOperations.getRecentProjects().map(project => ({
        ...project,
        name: StorageOperations.getProjectName(project.projectPath)
      }));

      setRecentProjects(updatedProjects);
    } catch (error) {
      console.error('Failed to remove recent project:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to remove project from recent list: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  return (
    <main className="welcome">
      <div className="titlebar" />
      <h1>Smelter</h1>
      <p>Content Management for Metalsmith refined</p>

      <ul className="projects">
        <li className="listHeader">Start</li>
        <li>
          <Link to="#" onClick={handleNewProject}>
            <FolderPlusIcon className="icon" />
            Initialize a Project from existing folder
          </Link>
        </li>
        <li>
          <Link to="#" onClick={handleCloneClick}>
            <GithubIcon className="icon" />
            Clone a Project from Github
          </Link>
        </li>
        <li>
          <Link to="#" onClick={handleEditProject}>
            <FolderOpenIcon className="icon" />
            Edit a Project
          </Link>
        </li>
        <li>
          <Link to="#" onClick={handleDeleteProject}>
            <FolderMinusIcon className="icon" />
            Delete a Project
          </Link>
        </li>

        {recentProjects.length > 0 && (
          <>
            <li className="listHeader recent">Recent</li>
            {recentProjects.map((project, index) => (
              <li key={index} className="recent-project">
                <Link
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRecentProjectClick(project);
                  }}
                >
                  {project.name}
                </Link>
                <span
                  className="delete-wrapper"
                  onClick={() => handleRemoveRecentProject(project)}
                >
                  <DeleteIcon className="delete-icon" />
                </span>
              </li>
            ))}
          </>
        )}
      </ul>
    </main>
  );
};

export default App;
