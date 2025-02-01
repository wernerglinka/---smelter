import { StorageOperations } from '../../lib/storage-operations.js';
import { setupEditForm, setupFormSubmission } from './setup-edit-form.js';
import { initializeEditor } from '../../lib/editor/setup.js';
/**
 * Sets up new page button handler
 * The edit area is empty and ready for new page content
 * @param {HTMLElement} button - New page button element
 */
const setupNewPageHandler = ( button ) => {
  button.addEventListener( 'click', async ( e ) => {
    e.preventDefault();

    try {
      // Show dialog to get a new page name
      const { status, data } = await window.electronAPI.dialog.open( 'showSaveDialog', {
        title: 'Create New Page',
        buttonLabel: 'Create Page',
        defaultPath: `${ StorageOperations.getContentPath() }/new-page.md`,
        filters: [
          { name: 'Markdown', extensions: [ 'md' ] }
        ],
        properties: [ 'createDirectory', 'showOverwriteConfirmation' ]
      } );

      // Handle dialog cancellation
      if ( status === 'failure' || data?.canceled ) {
        console.log( 'Dialog cancelled or failed' );
        return;
      }

      const filePath = data.filePath;
      const fileName = data.filePath.split( '/' ).pop();
      const mainForm = await setupEditForm( fileName );

      setupFormSubmission( mainForm, filePath );

      if ( !document.getElementById( 'editorWrapper' ) ) {
        window.mdeditor = initializeEditor();
      }

    } catch ( error ) {
      console.error( 'Error showing save dialog:', error );
    }
  } );
};

/**
 * Inits the new page functionality
 * This function called from renderEditSpace() after the page is rendered
 * @throws {Error} If when no button is found or init fails
 */
export const initNewPageProcess = async () => {
  try {
    // Get the button element
    const newPageButton = document.querySelector( '#init-new-page' );
    if ( !newPageButton ) {
      throw new Error( 'No new page button found' );
    }

    // Set up event handler
    setupNewPageHandler( newPageButton );

  } catch ( error ) {
    console.error( 'Failed to init new page :', error );
    throw error;
  }
};