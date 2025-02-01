const state = {
  projectPath: null,
  hasChanges: false
};

/**
 * Checks if repository has uncommitted changes
 * @returns {Promise<boolean>}
 */
const checkGitStatus = async () => {
  try {
    const response = await window.electronAPI.git.status( state.projectPath );

    // Check if we got a successful response with data
    if ( response.status === 'success' && response.data ) {
      state.hasChanges = response.data.modified.length > 0 ||
        response.data.not_added.length > 0;
    } else {
      state.hasChanges = false;
    }

    // Update menu state
    window.electronAPI.ipcRenderer.send( 'git-state-change', {
      hasChanges: state.hasChanges,
      hasProject: !!state.projectPath
    } );

    return state.hasChanges;
  } catch ( error ) {
    console.error( 'Git status check failed:', error );
    // Even on error, we should update menu state
    window.electronAPI.ipcRenderer.send( 'git-state-change', {
      hasChanges: false,
      hasProject: !!state.projectPath
    } );
    return false;
  }
};

/**
 * Updates git status after file changes
 */
const updateGitStatus = () => {
  if ( !state.projectPath ) return;
  checkGitStatus();
};

/**
 * Handle git commit operation
 */
const handleCommit = async () => {
  if ( !state.projectPath || !state.hasChanges ) return;

  try {
    const result = await window.electronAPI.dialog.showCustomMessage( {
      type: 'prompt',
      message: 'Enter commit message:',
      buttons: [ 'Commit', 'Cancel' ],
      input: true
    } );

    if ( !result?.response?.value || result.response.index !== 0 ) return;

    const commitMessage = result.response.value;
    if ( !commitMessage ) return;

    const commitResult = await window.electronAPI.git.commit( {
      projectPath: state.projectPath,
      message: commitMessage
    } );

    if ( commitResult.status === 'success' ) {
      await checkGitStatus();
    }
  } catch ( error ) {
    console.error( 'Commit error:', error );
  }
};

/**
 * Sets up git operation listeners
 */
const setupGitListeners = () => {
  window.electronAPI.ipcRenderer.removeListener( 'git-commit-trigger', handleCommit );
  window.electronAPI.ipcRenderer.on( 'git-commit-trigger', () => handleCommit() );
};

/**
 * Initializes git controls
 * @param {string} path - Project path
 */
const initGitControls = async ( path ) => {
  state.projectPath = path;
  setupGitListeners();
  await checkGitStatus();  // Initial status check
};

export { initGitControls, updateGitStatus };