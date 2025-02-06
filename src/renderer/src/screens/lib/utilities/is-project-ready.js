import { StorageOperations } from '../storage-operations.js';

/**
 * Checks if all required project paths are set in storage
 * @returns {boolean} True if all paths are set
 */
export const isProjectReady = () => {
  try {
    const projectFolder = StorageOperations.getProjectPath();
    const contentFolder = StorageOperations.getContentPath();
    const dataFolder = StorageOperations.getDataPath();

    return Boolean(projectFolder && contentFolder && dataFolder);
  } catch (error) {
    console.error('Failed to check project status:', error);
    return false;
  }
};
