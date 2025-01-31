// screens/home/handlers/open-project.js
import { navigate } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';
import { ProjectOperations } from '../../lib/project-operations.js';
import { selectProject } from '../../lib/select-project.js';

const ERRORS = {
  INVALID_PROJECT: 'This folder is not a valid project - .metallurgy folder not found!',
  OPEN_FAILED: 'Failed to open project'
};

/**
 * Opens project selection dialog and validates selection
 * @returns {Promise<string|null>} Selected project path or null
 */
const getProjectFromDialog = async () => {
  const projectFolder = await selectProject();

  if ( projectFolder === "abort" ) {
    return null;
  }

  const isValid = await ProjectOperations.validateProject( projectFolder );
  if ( !isValid ) {
    await window.electronAPI.dialog.showCustomMessage( {
      type: 'error',
      message: ERRORS.INVALID_PROJECT,
      buttons: [ 'OK' ]
    } );
    return null;
  }

  return projectFolder;
};

/**
 * Loads and saves project configuration
 * @param {string} projectFolder - Selected project path
 */
const setupProjectConfig = async ( projectFolder ) => {
  StorageOperations.saveProjectPath( projectFolder );
  const config = await ProjectOperations.loadProjectConfig( projectFolder );

  StorageOperations.saveProjectData( {
    projectPath: projectFolder,
    contentPath: config.contentPath,
    dataPath: config.dataPath
  } );
};

/**
 * Handles opening existing project
 * @param {Event} e - Click event
 */
export const handleEditProject = async ( e ) => {
  e.preventDefault();

  try {
    const targetScreen = e.target.href;
    const projectFolder = await getProjectFromDialog();

    if ( !projectFolder ) {
      return;
    }

    await setupProjectConfig( projectFolder );

    navigate( targetScreen );

  } catch ( error ) {
    console.error( "Error opening project:", error );
    await window.electronAPI.dialog.showCustomMessage( {
      type: 'error',
      message: `${ ERRORS.OPEN_FAILED }: ${ error.message }`,
      buttons: [ 'OK' ]
    } );
  }

};