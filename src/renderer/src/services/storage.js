// Migrated from storage-operations.js
const STORAGE_KEYS = {
  PROJECT_PATH: 'projectPath',
  PROJECT_DATA: 'projectData',
  CONTENT_PATH: 'contentPath',
  DATA_PATH: 'dataPath'
};

export const StorageService = {
  saveProjectPath: (path) => {
    localStorage.setItem(STORAGE_KEYS.PROJECT_PATH, path);
  },

  getProjectPath: () => {
    return localStorage.getItem(STORAGE_KEYS.PROJECT_PATH);
  },

  saveProjectData: (data) => {
    localStorage.setItem(STORAGE_KEYS.PROJECT_DATA, JSON.stringify(data));
  },

  getProjectData: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECT_DATA);
    return data ? JSON.parse(data) : null;
  },

  clearProjectData: () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECT_DATA);
    localStorage.removeItem(STORAGE_KEYS.PROJECT_PATH);
    localStorage.removeItem(STORAGE_KEYS.CONTENT_PATH);
    localStorage.removeItem(STORAGE_KEYS.DATA_PATH);
  },

  getProjectName: (path) => {
    return path.split('/').pop();
  }
};