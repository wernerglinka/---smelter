// screens/edit-project/build-templates-selection.js

/**
 * @typedef {Object} TemplatesElements
 * @property {HTMLElement} wrapper - Templates wrapper element
 * @property {HTMLElement} newPageButton - New page button element
 */

/**
 * Gets and validates required DOM elements
 * @returns {TemplatesElements} Object containing required elements
 * @throws {Error} If elements not found
 */
const getTemplatesElements = () => {
  const elements = {
    wrapper: document.querySelector( '.js-templates-wrapper' ),
  };

  if ( !elements.wrapper ) {
    throw new Error( 'Required template elements not found' );
  }

  return elements;
};

/**
 * Converts template data to draggable divs
 * @param {Object|Array} templatesData - Template data 
 * @param {HTMLElement} wrapper - Container element
 */
const createTemplateDivs = ( templatesData, wrapper ) => {
  // Get the first (and only) entry which contains the root path and templates array
  const [ rootPath, templates ] = Object.entries( templatesData )[ 0 ];

  let blocks = [];
  let pages = [];
  let sections = [];

  // Iterate over the templatesData array to extract blocks, pages, and sections
  templates.forEach( item => {
    if ( item.blocks ) {
      blocks = item.blocks;
    } else if ( item.pages ) {
      pages = item.pages;
    } else if ( item.sections ) {
      sections = item.sections;
    }
  } );

  // Handle pages array

  // insert header h3 'pages' before the first section
  const pagesh3 = document.createElement( 'h3' );
  pagesh3.textContent = 'Page Templates';
  pagesh3.className = 'section-header';
  wrapper.appendChild( pagesh3 );

  pages.forEach( ( page, pageIndex ) => {
    let [ pageName, pagePath ] = Object.entries( page )[ 0 ];

    if ( pageName !== 'index.js' ) {
      // calculate relative page path with respect to rootpath
      pagePath = pagePath.replace( rootPath, '' );

      const div = document.createElement( 'div' );
      div.id = `template-page-${ pageIndex }`;
      div.className = 'template-selection draggable';
      div.setAttribute( 'draggable', 'true' );
      div.setAttribute( 'data-url', pagePath );
      pageName = pageName
        .replace( /\.[^/.]+$/, '' ) // Remove file extension
        .replace( /-/g, ' ' )       // Replace all dashes with spaces
        .toUpperCase()              // Convert to uppercase
        .replace( 'PAGE', ' ' );    // Replace 'PAGE' with ""
      div.textContent = pageName;
      wrapper.appendChild( div );
    }
  } );

  // Handle sections array
  // insert header h3 'Sections' before the first section
  const sectionsh3 = document.createElement( 'h3' );
  sectionsh3.textContent = 'Section Templates';
  sectionsh3.className = 'section-header';
  wrapper.appendChild( sectionsh3 );

  sections.forEach( ( section, sectionIndex ) => {
    let [ sectionName, sectionPath ] = Object.entries( section )[ 0 ];

    if ( sectionName !== 'index.js' ) {
      // calculate relative section path with respect to rootpath
      sectionPath = sectionPath.replace( rootPath, '' );

      const div = document.createElement( 'div' );
      div.id = `template-section-${ sectionIndex }`;
      div.className = 'template-selection draggable';
      div.setAttribute( 'draggable', 'true' );
      div.setAttribute( 'data-url', sectionPath );
      sectionName = sectionName
        .replace( /\.[^/.]+$/, '' ) // Remove file extension
        .replace( /-/g, ' ' )       // Replace all dashes with spaces
        .toUpperCase()             // Convert to uppercase
        .replace( 'SECTION', ' ' ); // Replace 'SECTION' with ""
      div.textContent = sectionName;
      wrapper.appendChild( div );
    }
  } );

  // insert header h3 'blocks' before the first block
  const blocksh3 = document.createElement( 'h3' );
  blocksh3.textContent = 'Block Templates';
  blocksh3.className = 'block-header';
  wrapper.appendChild( blocksh3 );

  blocks.forEach( ( block, blockIndex ) => {
    let [ blockName, blockPath ] = Object.entries( block )[ 0 ];

    if ( blockName !== 'index.js' ) {
      // calculate relative block path with respect to rootpath
      blockPath = blockPath.replace( rootPath, '' );

      const div = document.createElement( 'div' );
      div.id = `template-block-${ blockIndex }`;
      div.className = 'template-selection draggable';
      div.setAttribute( 'draggable', 'true' );
      div.setAttribute( 'data-url', blockPath );
      blockName = blockName
        .replace( /\.[^/.]+$/, '' ) // Remove file extension
        .replace( /-/g, ' ' )       // Replace all dashes with spaces
        .toUpperCase()              // Convert to uppercase
        .replace( 'BLOCK', ' ' );   // Replace 'BLOCK' with ""
      div.textContent = blockName;
      wrapper.appendChild( div );
    }
  } );

};

/**
 * Builds templates selection interface
 * @returns {Promise<void>}
 * @throws {Error} If template loading or DOM operations fail
 */
const buildTemplatesSelection = async () => {
  try {
    // Get DOM elements
    const elements = getTemplatesElements();

    // Load templates
    const templates = await electronAPI.directories.getTemplates( 'templates' );
    if ( !templates?.data ) {
      throw new Error( 'No templates data received' );
    }

    // Build the template list with placeholder elements like the fields
    // loop over the templates, key is the template name, value is the template data
    // The placeholder should have this structure:
    // <div id="template<loop-iteration>" class="template-selection draggable" draggable="true" data-url="<value>">key of the template

    const templateWrapper = document.createElement( 'div' );
    templateWrapper.className = 'templates-wrapper';
    createTemplateDivs( templates.data, templateWrapper );
    elements.wrapper.appendChild( templateWrapper );

  } catch ( error ) {
    console.error( 'Failed to build templates:', error );
    throw error;
  }
};

export default buildTemplatesSelection;