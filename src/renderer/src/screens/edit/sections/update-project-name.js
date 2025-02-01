// screens/edit-project/update-project-name.js

/**
 * Retrieves project name from localStorage and updates DOM
 * @throws {Error} If project folder is not set or DOM element not found
 * @returns {void}
 */
const updateProjectName = () => {
  // Get DOM element first to fail fast
  const projectNameElement = document.getElementById( 'project-name' );
  if ( !projectNameElement ) {
    throw new Error( 'Project name element not found' );
  }

  // Get and validate project folder
  const projectFolder = localStorage.getItem( 'projectFolder' );
  if ( !projectFolder ) {
    throw new Error( 'Project folder not set in localStorage' );
  }

  // Extract project name from path
  const projectName = projectFolder
    .split( '/' )
    .filter( Boolean ) // Remove empty segments
    .pop();

  if ( !projectName ) {
    throw new Error( 'Invalid project folder path' );
  }

  // Update DOM
  projectNameElement.prepend( projectName );

  return projectFolder;
};

export default updateProjectName;