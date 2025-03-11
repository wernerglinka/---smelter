import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageOperations } from '@utils/services/storage';
import { ProjectOperations, selectProject } from '@utils/services/project';
import { useError } from '../../../context';
import { useAsyncOperation } from '../../../hooks/useAsyncOperation';
import { logger } from '@utils/services/logger';

/**
 * Context for managing home screen operations
 */
const HomeContext = createContext(null);

/**
 * HomeProvider component that provides home screen functionality
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 */
export const HomeProvider = ({ children }) => {
  const [recentProjects, setRecentProjects] = useState([]);
  const { handleError } = useError();
  const navigate = useNavigate();

  /**
   * Load recent projects with useAsyncOperation
   */
  const { loading: loadingProjects, execute: executeLoadRecentProjects } = useAsyncOperation({
    operation: async () => {
      const projects = StorageOperations.getRecentProjects();
      const projectsWithNames = projects.map((project) => ({
        ...project,
        name: StorageOperations.getProjectName(project.projectPath)
      }));
      setRecentProjects(projectsWithNames);
      return projectsWithNames;
    },
    operationName: 'loadRecentProjects'
  });

  /**
   * Load recent projects on component mount
   */
  useEffect(() => {
    executeLoadRecentProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle opening a recent project
   */
  const { loading: openingRecentProject, execute: openRecentProject } = useAsyncOperation({
    operation: async (projectData) => {
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
        await executeLoadRecentProjects();
        return null;
      }

      // Project exists, set it as current and navigate
      StorageOperations.setCurrentProject(projectData);
      navigate('/edit');
      return projectData;
    },
    operationName: 'openRecentProject'
  });

  /**
   * Handle initializing a new project
   */
  const { loading: initializingProject, execute: initializeProject } = useAsyncOperation({
    operation: async () => {
      const projectFolder = await selectProject();

      if (projectFolder === 'abort') return null;

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
        return projectData;
      } else {
        // If it's not a valid project, just navigate to new project screen
        navigate('/new');
        return { projectPath: projectFolder };
      }
    },
    operationName: 'initializeProject'
  });

  /**
   * Handle deleting a project
   */
  const { loading: deletingProject, execute: deleteProject } = useAsyncOperation({
    operation: async () => {
      const projectFolder = await selectProject();

      if (projectFolder === 'abort') {
        return null;
      }

      // Verify .metallurgy exists BEFORE doing anything else
      const { status: existsStatus } = await window.electronAPI.directories.exists(
        `${projectFolder}/.metallurgy`
      );

      if (existsStatus !== 'success') {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'This folder is not a valid project - .metallurgy folder not found!',
          buttons: ['OK']
        });
        return null;
      }

      const projectName = StorageOperations.getProjectName(projectFolder);
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'question',
        message: `Are you sure you want to delete ${projectName}?`,
        buttons: ['Yes', 'No']
      });

      // Check if user clicked "No" (index 1) or closed the dialog
      if (!response || response.index === 1) {
        return null;
      }

      // Delete the entire project folder
      const deleteResult = await window.electronAPI.directories.delete(projectFolder);

      if (deleteResult.status !== 'success') {
        throw new Error(`Failed to delete directory: ${deleteResult.error || 'Unknown error'}`);
      }

      // Remove from recent projects
      StorageOperations.removeFromRecentProjects(projectFolder);

      // Clear current project data
      StorageOperations.clearProjectData();

      await window.electronAPI.dialog.showCustomMessage({
        type: 'info',
        message: `Project ${projectName} deleted successfully`,
        buttons: ['OK']
      });

      // Get fresh data without triggering the executeLoadRecentProjects function
      const projects = StorageOperations.getRecentProjects();
      const projectsWithNames = projects.map((project) => ({
        ...project,
        name: StorageOperations.getProjectName(project.projectPath)
      }));
      setRecentProjects(projectsWithNames);
      
      return { projectFolder, projectName };
    },
    operationName: 'deleteProject'
  });

  /**
   * Handle editing an existing project
   */
  const { loading: editingProject, execute: editProject } = useAsyncOperation({
    operation: async () => {
      const projectFolder = await selectProject();

      if (projectFolder === 'abort') {
        return null;
      }

      // First verify this is a valid Metallurgy project
      const isValid = await ProjectOperations.validateProject(projectFolder);
      if (!isValid) {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'This folder is not a valid Metallurgy project. It must contain a .metallurgy folder with a valid projectData.json file.',
          buttons: ['OK']
        });
        return null;
      }

      // Load existing config without validation
      const configPath = `${projectFolder}/.metallurgy/projectData.json`;
      const { data: config } = await window.electronAPI.files.read(configPath);

      if (!config) {
        throw new Error('Failed to load project configuration');
      }

      const projectData = {
        projectPath: projectFolder,
        contentPath: config.contentPath,
        dataPath: config.dataPath
      };

      // Set as current project and navigate
      StorageOperations.setCurrentProject(projectData);
      navigate('/edit');
      return projectData;
    },
    operationName: 'editProject'
  });

  /**
   * Handle cloning a Github repository
   */
  const { loading: cloningGithub, execute: cloneGithub } = useAsyncOperation({
    operation: async () => {
      const result = await window.electronAPI.git.clone({});

      if (result?.status === 'success' && result?.proceed?.data === true) {
        const projectPath = result.path;

        // Clear any existing data first
        StorageOperations.clearProjectData();

        // Save only the project path for now
        StorageOperations.saveProjectPath(projectPath);

        navigate('/new');
        return { projectPath };
      }
      
      return null;
    },
    operationName: 'cloneGithub'
  });

  /**
   * Handle removing a project from recent projects
   */
  const { loading: removingRecentProject, execute: removeRecentProject } = useAsyncOperation({
    operation: async (project) => {
      // Remove from recent projects in storage
      StorageOperations.removeFromRecentProjects(project.projectPath);

      // Get fresh data without triggering the executeLoadRecentProjects function
      const projects = StorageOperations.getRecentProjects();
      const projectsWithNames = projects.map((project) => ({
        ...project,
        name: StorageOperations.getProjectName(project.projectPath)
      }));
      setRecentProjects(projectsWithNames);
      
      return project;
    },
    operationName: 'removeRecentProject'
  });

  const value = {
    // State
    recentProjects,
    
    // Loading states
    loadingProjects,
    openingRecentProject,
    initializingProject,
    deletingProject,
    editingProject,
    cloningGithub,
    removingRecentProject,
    
    // Methods
    loadRecentProjects: executeLoadRecentProjects,
    openRecentProject,
    initializeProject,
    deleteProject,
    editProject,
    cloneGithub,
    removeRecentProject
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

/**
 * Hook for accessing home screen context
 * @returns {Object} HomeContext value
 */
export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};