import { StorageOperations } from './storage-operations.js';

/**
 * Dialog configuration
 */
const DIALOG_CONFIG = {
  properties: [ 'openDirectory' ]
};

/**
 * Opens a folder selection dialog
 * @param {string} folderType - Type of folder being selected (e.g., 'content', 'data')
 * @returns {Promise<{filePaths: string[]}>} Selected folder path
 * @throws {Error} If dialog operation fails or folderType invalid
 */
export const selectFolder = async ( folderType ) => {
  try {
    if ( !folderType ) {
      throw new Error( 'Folder type is required' );
    }

    const projectFolder = StorageOperations.getProjectPath();
    if ( !projectFolder ) {
      console.warn( 'No project folder found in storage' );
    }

    const dialogOptions = {
      ...DIALOG_CONFIG,
      message: `Select the ${ folderType } Folder`,
      defaultPath: projectFolder || undefined
    };

    const result = await window.electronAPI.dialog.open( 'showOpenDialog', dialogOptions );

    return result.data.canceled ? [] : result.data.filePaths;

  } catch ( error ) {
    console.error( `Error selecting ${ folderType } folder:`, error );
    throw new Error( `Failed to select ${ folderType } folder: ${ error.message }` );
  }
};