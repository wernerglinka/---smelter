// screens/home/handlers/open-project.js
import { navigate } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';

const cloneGitHubRepo = async () => {
  try {
    return await window.electronAPI.git.clone();
  } catch ( error ) {
    console.error( 'Clone: Failed -', error );
    throw error;
  }
};

export const handleCloneGithub = async ( e ) => {
  console.log( 'handleCloneGithub called', e ? 'from button' : 'from menu' );
  if ( e?.preventDefault ) {
    e.preventDefault();
  }

  try {
    const result = await cloneGitHubRepo();
    console.log( 'Clone result:', result ); // Add this log

    // Changed from checking result?.proceed?.status === 'success'
    if ( result?.status === 'success' && result?.proceed.data === true ) {
      await StorageOperations.saveProjectPath( result.path );
      navigate( '../new-project/index.html' );
    }
  } catch ( error ) {
    console.error( 'Clone handler error:', error );
    return false;
  }
};