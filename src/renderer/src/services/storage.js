/**
 * @typedef {Object} ProjectPaths
 * @property {string} projectPath - Project root folder path
 * @property {string} contentPath - Content folder path
 * @property {string} dataPath - Data folder path
 */

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
    localStorage.setItem('projectFolder', path);
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
  getProjectPath: () => localStorage.getItem('projectFolder'),

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
   * @throws {Error} If required paths are missing
   */
  saveProjectData: (paths) => {
    const { projectPath, contentPath, dataPath } = paths;

    if (!projectPath || !contentPath || !dataPath) {
      throw new Error('All project paths are required');
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
  }
};
