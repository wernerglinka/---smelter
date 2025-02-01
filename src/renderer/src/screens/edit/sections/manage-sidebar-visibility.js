// screens/edit-project/manage-sidebar-visibility.js

import { ICONS } from '../../icons/index.js';

/**
 * Manages sidebar visibility state and toggle button appearance
 * @returns {void}
 * @throws {Error} If required DOM elements are not found
 */
const manageSidebarVisibility = () => {
  // Cache DOM elements
  const elements = {
    toggle: document.querySelector( '.js-sidebar-toggle' ),
    editPane: document.querySelector( '.edit-pane' ),
    sidebar: document.querySelector( '.js-sidebar' )
  };

  // Validate required elements exist
  Object.entries( elements ).forEach( ( [ key, element ] ) => {
    if ( !element ) {
      throw new Error( `Required element ${ key } not found` );
    }
  } );

  /**
   * Updates toggle button state and icon
   * @param {boolean} isVisible - Current sidebar visibility
   */
  const updateToggleState = ( isVisible ) => {
    elements.toggle.innerHTML = isVisible ? ICONS.HIDESIDEBAR : ICONS.VIEWSIDEBAR;
    elements.toggle.setAttribute( 'aria-expanded', isVisible.toString() );
    elements.toggle.setAttribute( 'aria-label', `${ isVisible ? 'Hide' : 'Show' } Sidebar` );
  };

  // Handle toggle click events
  elements.toggle.addEventListener( 'click', () => {
    const isVisible = !elements.sidebar.classList.contains( 'hidden' );

    // Toggle state classes
    elements.toggle.classList.toggle( 'isClosed' );
    elements.sidebar.classList.toggle( 'hidden' );
    elements.editPane.classList.toggle( 'full-width' );

    // Update toggle button
    updateToggleState( !isVisible );
  } );

  // Set initial state
  updateToggleState( !elements.sidebar.classList.contains( 'hidden' ) );
};

export default manageSidebarVisibility;