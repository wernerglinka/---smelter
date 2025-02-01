import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderPlusIcon, FolderOpenIcon, FolderMinusIcon, GithubIcon } from '../../components/icons';
import { StorageOperations } from '../../services/storage';
import { selectProject } from './utils/select-project';
import { handleDeleteProject } from './handlers/delete-project';
import { handleCloneGithub } from './handlers/clone-github';
import { TitleBar } from '../../styles/common';
import {
  WelcomeContainer,
  ProjectList,
  ProjectItem,
  ProjectLink,
  ListHeader,
  RecentProjectItem,
  RecentProjectLink
} from './styles';

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
        const projectData = StorageOperations.getProjectData();
        if (projectData) {
          setRecentProjects([{
            path: projectData.projectPath,
            name: projectData.name || projectData.projectPath.split('/').pop()
          }]);
        } else {
          setRecentProjects([]);
        }
      } catch (error) {
        console.error('Failed to load recent projects:', error);
      }
    };

    loadRecentProjects();
  }, []);

  /**
   * Handles initializing a new project
   * @param {React.MouseEvent} e - Click event
   */
  const handleNewProject = async (e) => {
    e.preventDefault();
    try {
      const projectFolder = await selectProject();

      if (projectFolder === "abort") return;

      StorageOperations.saveProjectPath(projectFolder);
      StorageOperations.clearProjectData();

      navigate('/edit');
    } catch (error) {
      console.error('Error creating new project:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to create project: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  return (
    <WelcomeContainer>
      <TitleBar />
      <h1>Smelter</h1>
      <p>Content Management for Metalsmith refined</p>

      <ProjectList>
        <ListHeader>Start</ListHeader>
        <ProjectItem>
          <ProjectLink href="#" onClick={handleNewProject}>
            <FolderPlusIcon className="icon" />
            Initialize a Project from existing folder
          </ProjectLink>
        </ProjectItem>
        <ProjectItem>
          <ProjectLink to="/edit">
            <FolderOpenIcon className="icon" />
            Edit Project
          </ProjectLink>
        </ProjectItem>
        <ProjectItem>
          <ProjectLink href="#" onClick={handleDeleteProject}>
            <FolderMinusIcon className="icon" />
            Delete a Project
          </ProjectLink>
        </ProjectItem>
        <ProjectItem>
          <ProjectLink href="#" onClick={handleCloneGithub}>
            <GithubIcon className="icon" />
            Clone a Project from Github
          </ProjectLink>
        </ProjectItem>

        {recentProjects.length > 0 && (
          <>
            <RecentProjectItem>Recent Projects</RecentProjectItem>
            {recentProjects.map((project, index) => (
              <ProjectItem key={index}>
                <RecentProjectLink to={`/edit/${encodeURIComponent(project.path)}`}>
                  {project.name}
                </RecentProjectLink>
              </ProjectItem>
            ))}
          </>
        )}
      </ProjectList>
    </WelcomeContainer>
  );
};

export default App;
