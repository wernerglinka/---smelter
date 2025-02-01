import getFolderName from "./utilities/get-folder-name.js";
import { StorageOperations } from "./storage-operations.js";

/**
 * @typedef {Object} FolderUIElements
 * @property {HTMLElement} nameElement - Folder name element
 * @property {HTMLElement} wrapper - Parent wrapper element
 */

/**
 * Gets required DOM elements for folder UI updates
 * @param {string} folderType - Type of folder being updated
 * @returns {FolderUIElements} Object containing required elements
 * @throws {Error} If elements not found
 */
const getFolderUIElements = ( folderType ) => {
  const nameElement = document.querySelector( `.js-${ folderType }-folder-name` );
  if ( !nameElement ) {
    throw new Error( `Folder name element not found for: ${ folderType }` );
  }

  const wrapper = nameElement.closest( '.js-get-path' );
  if ( !wrapper ) {
    throw new Error( 'Folder wrapper element not found' );
  }

  return { nameElement, wrapper };
};

/**
 * Updates UI elements with folder information
 * @param {string} folderType - Type of folder being updated
 * @param {string} contentFolder - Content folder path
 * @throws {Error} If update fails or inputs invalid
 * @returns {void}
 */
export const updateFolderUI = ( folderType, contentFolder ) => {
  try {
    // Validate inputs
    if ( !folderType || !contentFolder ) {
      throw new Error( 'Folder type and content folder are required' );
    }

    // Get project info
    const projectFolder = StorageOperations.getProjectPath();
    if ( !projectFolder ) {
      throw new Error( 'Project folder not found in storage' );
    }

    // Generate folder name
    const projectName = StorageOperations.getProjectName( projectFolder );
    const folderName = getFolderName( projectName, contentFolder );

    // Update UI
    const { nameElement, wrapper } = getFolderUIElements( folderType );
    nameElement.innerText = folderName;
    wrapper.classList.add( 'ready' );

  } catch ( error ) {
    console.error( 'Failed to update folder UI:', error );
    throw error;
  }
};