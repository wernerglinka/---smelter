// screens/home/handlers/delete-project.js
import { reload } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';
import { ProjectOperations } from '../../lib/project-operations.js';
import { selectProject } from '../../lib/select-project.js';

export const handleDeleteProject = async ( e ) => {
  e.preventDefault();

  try {
    // 1. First select the project
    const projectFolder = await selectProject();
    if ( !projectFolder ) return reload();

    // 2. Verify .metallurgy exists BEFORE doing anything else
    const response = await window.electronAPI.directories.exists(
      `${ projectFolder }/.metallurgy`
    );
    const metallurgyExists = response.status === 'success' && response.data === true;

    if ( !metallurgyExists ) {
      await window.electronAPI.dialog.showCustomMessage( {
        type: 'error',
        message: 'This folder is not a valid project - .metallurgy folder not found!',
        buttons: [ 'OK' ]
      } );
      return reload();
    }

    // 3. Only continue if .metallurgy exists
    const projectName = StorageOperations.getProjectName( projectFolder );
    const userConfirmed = await ProjectOperations.confirmDeletion( projectName );

    if ( !userConfirmed ) {
      return reload();
    }

    // 4. Attempt deletion
    await ProjectOperations.deleteProject( projectFolder );
    StorageOperations.clearProjectData();

    await window.electronAPI.dialog.showCustomMessage( {
      type: 'success',
      message: `Project ${ projectName } deleted successfully`,
      buttons: [ 'OK' ]
    } );

    reload();
  } catch ( error ) {
    console.error( "Error in delete process:", error );
    await window.electronAPI.dialog.showCustomMessage( {
      type: 'error',
      message: `Failed to delete project: ${ error.message }`,
      buttons: [ 'OK' ]
    } );
    reload();
  }
};