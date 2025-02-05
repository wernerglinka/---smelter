// screens/home/handlers/edit-project.js
import { StorageOperations } from '../../../services/storage';
import { ProjectOperations } from '../../../services/project';
import { selectProject } from '../../lib/utilities/select-project';

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
    console.log('Starting edit project flow');
    const projectFolder = await getProjectFromDialog();
    console.log('Selected project folder:', projectFolder);

    if (!projectFolder) {
      console.log('No project folder selected');
      return;
    }

    await setupProjectConfig(projectFolder);
    console.log('Project config setup complete');

    // Add this: Get the project data and add to recent projects
    const projectData = StorageOperations.getProjectData();
    StorageOperations.setCurrentProject(projectData);

    window.location.hash = '/edit';
  } catch (error) {
    console.error('Error opening project:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `${ERRORS.OPEN_FAILED}: ${error.message}`,
      buttons: ['OK']
    });
  }
};
