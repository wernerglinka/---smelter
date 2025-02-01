// lib/project-operations.js
export const ProjectOperations = {
  validateProject: async ( projectFolder ) => {
    const metallurgyPath = `${ projectFolder }/.metallurgy`;
    return await window.electronAPI.directories.exists( metallurgyPath );
  },

  loadProjectConfig: async ( projectFolder ) => {
    const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;
    const result = await window.electronAPI.files.read( configFilePath );
    if ( result.status === 'failure' ) {
      throw new Error( `Failed to read project config: ${ result.error }` );
    }
    return result.data;
  },

  deleteProject: async ( projectFolder ) => {
    const metallurgyPath = `${ projectFolder }/.metallurgy`;
    // Verify .metallurgy folder exists before deletion
    const folderExists = await window.electronAPI.directories.exists( metallurgyPath );
    if ( !folderExists ) {
      throw new Error( 'Project configuration folder .metallurgy not found' );
    }

    const result = await window.electronAPI.directories.delete( metallurgyPath );
    if ( result.status === 'failure' ) {
      throw new Error( `Failed to delete .metallurgy folder: ${ result.error }` );
    }
    return true;
  },

  confirmDeletion: async ( projectName ) => {
    const result = await window.electronAPI.dialog.showCustomMessage( {
      type: 'warning',
      message: `Are you sure you want to remove the ${ projectName } project?`,
      buttons: [ 'Yes', 'No' ]
    } );
    return result?.response?.index === 0;
  }
};