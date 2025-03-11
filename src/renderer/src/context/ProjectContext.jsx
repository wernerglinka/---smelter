import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StorageOperations } from '@utils/services/storage';
import { useError } from './ErrorContext';
import { logger } from '@utils/services/logger';

/**
 * @typedef {Object} ProjectContextValue
 * @property {string} projectName - Current project name
 * @property {string} projectPath - Path to the current project
 * @property {boolean} isLoading - Whether project data is loading
 * @property {Function} loadProject - Load a project by path
 * @property {Function} saveProjectData - Save project data
 */

export const ProjectContext = createContext(null);

/**
 * Provider for project information
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const ProjectProvider = ({ children }) => {
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { handleError } = useError();

  /**
   * Load project data from storage
   */
  const loadProjectData = useCallback(() => {
    try {
      setIsLoading(true);
      const projectData = StorageOperations.getProjectData();
      
      if (projectData) {
        setProjectPath(projectData.projectPath);
        setProjectName(StorageOperations.getProjectName(projectData.projectPath));
        logger.info(`Loaded project: ${projectData.projectPath}`);
      } else {
        logger.info('No project data available');
      }
    } catch (error) {
      handleError(error, 'loadProjectData');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Load a specific project by path
   * @param {string} path - Project path to load
   */
  const loadProject = useCallback((path) => {
    try {
      setIsLoading(true);
      
      // Validate path exists
      if (!path) {
        throw new Error('Project path is required');
      }

      // Save project data to storage
      StorageOperations.saveProjectData({ projectPath: path });
      
      // Update state
      setProjectPath(path);
      setProjectName(StorageOperations.getProjectName(path));
      
      logger.info(`Loaded project: ${path}`);
    } catch (error) {
      handleError(error, 'loadProject');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  /**
   * Save project data
   * @param {Object} data - Project data to save
   */
  const saveProjectData = useCallback((data) => {
    try {
      StorageOperations.saveProjectData(data);
      logger.info('Saved project data');
      
      // Update state if projectPath is changing
      if (data.projectPath && data.projectPath !== projectPath) {
        setProjectPath(data.projectPath);
        setProjectName(StorageOperations.getProjectName(data.projectPath));
      }
    } catch (error) {
      handleError(error, 'saveProjectData');
    }
  }, [handleError, projectPath]);

  // Load project data on mount
  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const value = {
    projectName,
    projectPath,
    isLoading,
    loadProject,
    saveProjectData
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

/**
 * Hook to access project context
 * @returns {ProjectContextValue}
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}