// screens/home/handlers/edit-project.js
import { StorageOperations } from '@services/storage';
import { ProjectOperations } from '@services/project';
import { selectProject } from '@lib/utilities/select-project';

const ERRORS = {
  INVALID_PROJECT:
    'This folder is not a valid Metallurgy project. It must contain a .metallurgy folder with a valid projectData.json file.',
  OPEN_FAILED: 'Failed to open project'
};

/**
 * Opens project selection dialog and validates selection
 * @returns {Promise<string|null>} Selected project path or null
 */
const getProjectFromDialog = async () => {
  const projectFolder = await selectProject();

  if (projectFolder === 'abort') {
    return null;
  }

  const isValid = await ProjectOperations.validateProject(projectFolder);
  if (!isValid) {
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: ERRORS.INVALID_PROJECT,
      buttons: ['OK']
    });
    return null;
  }

  return projectFolder;
};

/**
 * Loads and saves project configuration
 * @param {string} projectFolder - Selected project path
 */
const setupProjectConfig = async (projectFolder) => {
  try {
    // Clear any existing project data first
    StorageOperations.clearProjectData();

    // Then save new project data
    StorageOperations.saveProjectPath(projectFolder);
    const config = await ProjectOperations.loadProjectConfig(projectFolder);

    StorageOperations.saveProjectData({
      projectPath: projectFolder,
      contentPath: config.contentPath,
      dataPath: config.dataPath
    });
  } catch (error) {
    throw new Error(`Failed to load project configuration: ${error.message}`);
  }
};

/**
 * Handles opening existing project
 * @param {Event} e - Click event
 */
export const handleEditProject = async (e) => {
  e.preventDefault();

  try {
    const projectFolder = await getProjectFromDialog();

    if (!projectFolder) {
      return;
    }

    // First verify this is a valid Metallurgy project
    const isValid = await ProjectOperations.validateProject(projectFolder);
    if (!isValid) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: ERRORS.INVALID_PROJECT,
        buttons: ['OK']
      });
      return;
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
    window.location.hash = '/edit';
  } catch (error) {
    console.error('Error opening project:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to open project: ${error.message}`,
      buttons: ['OK']
    });
  }
};
