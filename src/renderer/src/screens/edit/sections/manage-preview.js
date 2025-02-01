// screens/edit-project/preview/manage-preview.js

import { preprocessFormData } from "../../lib/form-submission/preprocess-form-data.js";
/**
 * @typedef {Object} PreviewElements
 * @property {HTMLElement} editPane - Main edit pane
 * @property {HTMLElement} previewButton - Preview toggle button
 * @property {HTMLElement} previewPane - Preview content pane
 */

/**
 * Gets and validates required DOM elements
 * @returns {PreviewElements} Object containing required elements
 * @throws {Error} If elements not found
 */
const getPreviewElements = () => {
  const elements = {
    editPane: document.querySelector( '.js-edit-pane' ),
    previewButton: document.getElementById( 'preview-button' ),
    previewPane: document.querySelector( '.js-preview-pane' )
  };

  Object.entries( elements ).forEach( ( [ key, element ] ) => {
    if ( !element ) {
      throw new Error( `Required preview element "${ key }" not found` );
    }
  } );

  return elements;
};

/**
 * Updates preview pane content
 * @param {PreviewElements} elements - DOM elements
 * @param {Object} data - Form data to display
 */
const updatePreviewContent = ( elements, data ) => {
  try {
    const yamlContent = window.electronAPI.utils.toYAML( data );
    elements.previewPane.innerHTML = `<pre>${ yamlContent }</pre>`;
  } catch ( error ) {
    console.error( 'Failed to convert data to YAML:', error );
    elements.previewPane.innerHTML = '<pre>Error generating preview</pre>';
  }
};

/**
 * Manages preview pane visibility and content updates
 * @throws {Error} If required elements not found
 */
const managePreview = () => {
  const elements = getPreviewElements();

  elements.previewButton.addEventListener( 'click', ( e ) => {
    e.preventDefault();

    try {
      elements.editPane.classList.toggle( 'active' );
      const formData = preprocessFormData();
      updatePreviewContent( elements, formData );
    } catch ( error ) {
      console.error( 'Preview generation failed:', error );
    }
  } );
};

export default managePreview;