import { StorageOperations } from '../storage-operations.js';
import { selectProject } from '../select-project.js';

const handleNewProject = async ( e ) => {
  e.preventDefault();
  try {
    const targetScreen = e.target.href;
    const projectFolder = await selectProject();

    if ( projectFolder === "abort" ) return;

    // For new projects, we just save the folder path
    StorageOperations.saveProjectPath( projectFolder );
    StorageOperations.clearProjectData();

    navigate( targetScreen );  // This will go to new-project/index.html
  } catch ( error ) {
    console.error( "Error creating new project:", error );
    await window.electronAPI.dialog.showCustomMessage( {
      type: 'error',
      message: `Failed to create project: ${ error.message }`,
      buttons: [ 'OK' ]
    } );
  }
};

export default handleNewProject;