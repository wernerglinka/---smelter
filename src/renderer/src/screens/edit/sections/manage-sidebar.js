// screens/edit-project/manage-sidebar.js

/**
 * Manages sidebar panes selection and drag-drop initialization
 * @param {Function} dragStartHandler - Handler for drag start events
 * @throws {Error} If required DOM elements not found
 */
const manageSidebar = ( dragStartHandler ) => {
  // Cache DOM queries
  const elements = {
    links: document.querySelectorAll( '.js-sidebar-pane-selection a' ),
    panes: document.querySelectorAll( '.js-sidebar-pane' ),
    componentsPane: document.getElementById( 'js-add-field' ),
    templatesPane: document.getElementById( 'js-add-template' )
  };

  // Validate required elements
  if ( !elements.componentsPane || !elements.templatesPane ) {
    throw new Error( 'Required sidebar elements not found' );
  }

  // Handle pane switching
  elements.links.forEach( link => {
    link.addEventListener( 'click', ( e ) => {
      e.preventDefault();

      // Deactivate all panes and links
      elements.panes.forEach( pane => pane.classList.remove( 'active' ) );
      elements.links.forEach( link => link.classList.remove( 'active' ) );

      // Activate selected pane and link
      const selectedPane = e.target.dataset.pane;
      document.getElementById( selectedPane )?.classList.add( 'active' );
      e.target.classList.add( 'active' );
    } );
  } );

  // Initialize drag-drop
  elements.componentsPane.addEventListener( 'dragstart', dragStartHandler );
  elements.templatesPane.addEventListener( 'dragstart', dragStartHandler );
};

export default manageSidebar;