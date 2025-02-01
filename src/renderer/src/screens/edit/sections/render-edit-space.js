// screens/edit-project/sections/render-edit-space.js

import { getDirectoryFiles } from "../../lib/file-ops/get-directory-files.js";
import { getMarkdownFile } from "../../lib/file-ops/get-markdown-file.js";
import { getMetadataFile } from "../../lib/file-ops/get-metadata-file.js";
import { frontmatterToForm } from "../../lib/form-generation/frontmatter-to-form.js";
import { redoUndo } from "../../lib/undo-redo.js";
import { initNewPageProcess } from "./init-new-page-process.js";
import { setupEditForm, setupFormSubmission } from './setup-edit-form.js';
import { initNpmControls } from './npm-controls.js';
import { initGitControls } from './git-controls.js';

/**
 * Get directory files and render a DOM tree representation
 * for content and metadata files
 * @throws {Error} If file loading fails
 */
const loadDirectoryFiles = async () => {
  try {
    await Promise.all( [
      getDirectoryFiles( 'contentFolder', '.md' ),
      getDirectoryFiles( 'dataFolder', '.json' )
    ] );
  } catch ( error ) {
    throw new Error( `Failed to load directory files: ${ error.message }` );
  }
};

/**
 * Sets up folder toggle functionality
 */
const setupFolderToggles = () => {
  const toggleHandler = ( e ) => {
    e.preventDefault();
    const folder = e.target.closest( 'li' );
    folder.classList.toggle( 'open' );
  };

  document.querySelectorAll( 'li.folder > span' )
    .forEach( toggle => toggle.addEventListener( 'click', toggleHandler ) );
};

/**
 * Updates active state of file links
 * @param {HTMLElement} activeLink - Currently selected link
 */
const updateActiveLinkState = ( activeLink ) => {
  document.querySelectorAll( '.js-dom-tree .file a' )
    .forEach( link => link.classList.remove( 'active' ) );
  activeLink.classList.add( 'active' );
};

/**
 * Handles file content based on type
 * @param {string} filePath - Path to file
 * @param {string} fileType - Type of file (md/json)
 * @throws {Error} If file type not supported
 */
const handleFileContent = async ( filePath, fileType ) => {
  switch ( fileType ) {
    case 'md':
      const { frontmatter, content } = await getMarkdownFile( filePath );
      await frontmatterToForm( frontmatter, content );
      break;
    case 'json':
      const metadata = await getMetadataFile( filePath );
      //renderJSONFile( metadata );
      await frontmatterToForm( metadata, '' );
      break;
    default:
      throw new Error( `Unsupported file type: ${ fileType }` );
  }
};

/**
 * When filename in sidebar is clicked, open the file in the editor
 * @param {Event} e - Click event
 */
const handleFileSelection = async ( e ) => {
  e.preventDefault();
  e.stopPropagation();

  const selectedFile = e.target.closest( 'li' );
  const filePath = selectedFile.querySelector( 'a' ).href;
  const fileType = filePath.split( '.' ).pop();
  const fileName = filePath.split( '/' ).pop();

  updateActiveLinkState( e.target );

  const mainForm = await setupEditForm( fileName );

  try {
    await handleFileContent( filePath, fileType );
    mainForm.appendChild( redoUndo() );
    setupFormSubmission( mainForm, filePath );
  } catch ( error ) {
    console.error( 'Failed to handle file:', error );
  }
};

/**
 * Sets up template link handlers
 */
const setupTemplateLinks = () => {
  const preventDefaultHandler = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.querySelectorAll( '.js-templates-list .file a' )
    .forEach( link => link.addEventListener( 'click', preventDefaultHandler ) );
};

/**
 * Main function to render the edit space
 * @throws {Error} If rendering fails
 */
const renderEditSpace = async ( projectPath ) => {
  try {
    // Get directory files and render a DOM tree representation
    await loadDirectoryFiles();

    // directories are closed by default, toggle open by clicking on folder name
    setupFolderToggles();

    // Click on a file name to open the file in the editor
    document.querySelectorAll( '.js-files-list .file a' )
      .forEach( link => link.addEventListener( 'click', handleFileSelection ) );

    setupTemplateLinks();

    initNewPageProcess();

    // Setup NPM controls for the edit space
    initNpmControls( projectPath );

    // Setup Git controls for the edit space
    initGitControls( projectPath );  // Removed dialogOps parameter

  } catch ( error ) {
    console.error( 'Failed to render edit space:', error );
    throw error;
  }
};

export default renderEditSpace;