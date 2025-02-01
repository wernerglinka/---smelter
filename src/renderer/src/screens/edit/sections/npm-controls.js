// npm-controls.js

/**
 * State management for npm controls
 */
const state = {
  isRunning: false,
  projectPath: null
};

/**
 * Handles output messages from npm commands
 * @param {string} message - Output message to display
 */
const handleOutput = ( message ) => {
  const outputEl = document.getElementById( 'npm-output' );
  if ( outputEl ) {
    outputEl.textContent += message;
    outputEl.scrollTop = outputEl.scrollHeight;
  }
};

/**
 * Handles error messages
 * @param {string} message - Error message to display
 */
const handleError = ( message ) => {
  const errorEl = document.getElementById( 'npm-error' );
  if ( errorEl ) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
};

/**
 * Clears output and error messages
 */
const clearMessages = () => {
  const outputEl = document.getElementById( 'npm-output' );
  const errorEl = document.getElementById( 'npm-error' );

  if ( outputEl ) outputEl.textContent = '';
  if ( errorEl ) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
};

/**
 * Starts the npm project
 */
const startProject = async () => {
  if ( !state.projectPath ) return;

  try {
    clearMessages();
    const result = await window.electronAPI.npm.start( state.projectPath );

    if ( result.status === 'success' ) {
      state.isRunning = true;
      updateNpmState();
    }
  } catch ( error ) {
    handleError( error.message );
  }
};

/**
 * Stops the running npm process
 */
const stopProject = async () => {
  try {
    const result = await window.electronAPI.npm.stop();

    if ( result.status === 'success' ) {
      state.isRunning = false;
      updateNpmState();
    }
  } catch ( error ) {
    handleError( error.message );
  }
};

/**
 * Installs project dependencies
 */
const installDeps = async () => {
  if ( !state.projectPath ) return;

  try {
    clearMessages();
    const result = await window.electronAPI.npm.install( state.projectPath );

    if ( result.status === 'failure' ) {
      handleError( result.error );
    } else {
      handleOutput( 'Dependencies installed successfully!\n' );
      updateNpmState();
    }
  } catch ( error ) {
    handleError( error.message );
  }
};

/**
 * Checks if node_modules directory exists
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<boolean>} True if node_modules exists
 */
const hasNodeModules = async ( projectPath ) => {
  try {
    const result = await window.electronAPI.directories.exists(
      `${ projectPath }/node_modules`
    );
    return result.status === 'success' && result.data === true;
  } catch ( error ) {
    console.error( 'Error checking node_modules:', error );
    return false;
  }
};

const updateNpmState = async () => {
  const hasModules = await hasNodeModules( state.projectPath );

  window.electronAPI.ipcRenderer.send( 'npm-state-change', {
    running: state.isRunning,
    hasNodeModules: hasModules,
    hasProject: !!state.projectPath
  } );
};


/**
 * Sets up event listeners for npm operations
*/
const setupListeners = async () => {
  // Remove any existing listeners
  window.electronAPI.ipcRenderer.removeListener( 'npm-install-trigger', installDeps );
  window.electronAPI.ipcRenderer.removeListener( 'npm-start-trigger', startProject );
  window.electronAPI.ipcRenderer.removeListener( 'npm-stop-trigger', stopProject );

  // Add menu triggers
  window.electronAPI.ipcRenderer.on( 'npm-install-trigger', () => installDeps() );
  window.electronAPI.ipcRenderer.on( 'npm-start-trigger', () => startProject() );
  window.electronAPI.ipcRenderer.on( 'npm-stop-trigger', () => stopProject() );

  // Check node_modules for initial menu state
  const hasModules = await hasNodeModules( state.projectPath );
  window.electronAPI.ipcRenderer.send( 'npm-state-change', {
    running: state.isRunning,
    hasNodeModules: hasModules
  } );

  updateNpmState();
};

/**
 * Initializes npm controls
 * @param {string} path - Project path
 */
const initNpmControls = ( path ) => {
  state.projectPath = path;
  setupListeners();
};

export {
  initNpmControls,
  startProject,
  stopProject,
  installDeps
};