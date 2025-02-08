/**
 * @typedef {Object} ProjectPaths
 * @property {string} projectPath - Project root folder path
 * @property {string} contentPath - Content folder path
 * @property {string} dataPath - Data folder path
 */

const MAX_RECENT_PROJECTS = 5;
const STORAGE_KEYS = {
  PROJECT_PATH: 'projectFolder',
  CONTENT_PATH: 'contentFolder',
  DATA_PATH: 'dataFolder',
  RECENT_PROJECTS: 'recentProjects'
};

/**
 * Utilities to interact with local storage for project management
 */
export const StorageOperations = {
  /**
   * Saves project root path
   * @param {string} path - Project root path
   */
  saveProjectPath: (path) => {
    if (!path) throw new Error('Project path is required');
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECT_PATH, path);
      // Verify the save was successful
      const savedPath = localStorage.getItem(STORAGE_KEYS.PROJECT_PATH);
      if (savedPath !== path) {
        throw new Error('Failed to verify saved project path');
      }
      console.log('Successfully saved project path:', path); // Debug log
    } catch (error) {
      console.error('Error saving project path:', error);
      throw error;
    }
  },

  saveContentPath: (path) => {
    if (!path) throw new Error('Content path is required');
    localStorage.setItem('contentFolder', path);
  },

  saveDataPath: (path) => {
    if (!path) throw new Error('Data path is required');
    localStorage.setItem('dataFolder', path);
  },

  /**
   * Gets project root path
   * @returns {string|null} Project path or null if not found
   */
  getProjectPath: () => {
    const path = localStorage.getItem(STORAGE_KEYS.PROJECT_PATH);
    console.log('Retrieved project path from storage:', path); // Debug log
    return path;
  },

  /**
   * Gets content folder path
   * @returns {string|null} Content path or null if not found
   */
  getContentPath: () => localStorage.getItem('contentFolder'),

  /**
   * Gets data folder path
   * @returns {string|null} Data path or null if not found
   */
  getDataPath: () => localStorage.getItem('dataFolder'),

  /**
   * Saves all project paths
   * @param {ProjectPaths} paths - Object containing all project paths
   * @throws {Error} If required paths are missing or inconsistent
   */
  saveProjectData: (paths) => {
    const { projectPath, contentPath, dataPath } = paths;

    if (!projectPath || !contentPath || !dataPath) {
      throw new Error('All project paths are required');
    }

    // Validate that content and data paths are within project path
    if (!contentPath.startsWith(projectPath)) {
      throw new Error('Content path must be within project directory');
    }
    if (!dataPath.startsWith(projectPath)) {
      throw new Error('Data path must be within project directory');
    }

    localStorage.setItem('projectFolder', projectPath);
    localStorage.setItem('contentFolder', contentPath);
    localStorage.setItem('dataFolder', dataPath);
  },

  /**
   * Gets all project data
   * @returns {ProjectPaths|null} Project paths or null if not found
   */
  getProjectData: () => {
    const projectPath = localStorage.getItem('projectFolder');
    const contentPath = localStorage.getItem('contentFolder');
    const dataPath = localStorage.getItem('dataFolder');

    return projectPath
      ? {
          projectPath,
          contentPath,
          dataPath
        }
      : null;
  },

  /**
   * Clears all project data from storage
   */
  clearProjectData: () => {
    ['projectFolder', 'contentFolder', 'dataFolder'].forEach((key) => localStorage.removeItem(key));
  },

  /**
   * Extracts project name from path
   * @param {string} path - Project path
   * @returns {string} Project name
   * @throws {Error} If path is invalid
   */
  getProjectName: (path) => {
    if (!path) throw new Error('Path is required');
    const name = path.split('/').pop();
    if (!name) throw new Error('Invalid path format');
    return name;
  },

  /**
   * Gets the list of recent projects
   * @returns {ProjectPaths[]} Array of recent projects
   */
  getRecentProjects: () => {
    const projects = localStorage.getItem('recentProjects');
    const parsedProjects = projects ? JSON.parse(projects) : [];
    console.log('Getting recent projects:', parsedProjects);
    return parsedProjects;
  },

  /**
   * Adds a project to recent projects list
   * @param {ProjectPaths} projectData - Project data to add
   */
  addToRecentProjects: (projectData) => {
    console.log('Adding to recent projects:', projectData);
    const recentProjects = StorageOperations.getRecentProjects();
    console.log('Current recent projects:', recentProjects);

    // Remove this project if it already exists in the list
    const filteredProjects = recentProjects.filter(
      (project) => project.projectPath !== projectData.projectPath
    );

    // Add new project to the beginning
    filteredProjects.unshift(projectData);

    // Keep only the most recent MAX_RECENT_PROJECTS
    const updatedProjects = filteredProjects.slice(0, MAX_RECENT_PROJECTS);

    localStorage.setItem('recentProjects', JSON.stringify(updatedProjects));
    console.log('Updated recent projects:', updatedProjects);
  },

  /**
   * Sets current working project
   * @param {ProjectPaths} projectData - Project data to set as current
   */
  setCurrentProject: (projectData) => {
    console.log('Setting current project:', projectData);
    // First clear ALL existing project data
    StorageOperations.clearProjectData();
    // Then save new project data
    StorageOperations.saveProjectData(projectData);
    StorageOperations.addToRecentProjects(projectData);
  },

  /**
   * Removes a project from recent projects list
   * @param {string} projectPath - Path of project to remove
   */
  removeFromRecentProjects: (projectPath) => {
    const recentProjects = StorageOperations.getRecentProjects();
    const filteredProjects = recentProjects.filter(
      (project) => project.projectPath !== projectPath
    );
    localStorage.setItem('recentProjects', JSON.stringify(filteredProjects));
  }
};
