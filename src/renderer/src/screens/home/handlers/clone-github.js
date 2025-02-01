import { StorageOperations } from '../../../services/storage';

export const handleCloneGithub = async (e) => {
  if (e?.preventDefault) {
    e.preventDefault();
  }

  try {
    const result = await window.electronAPI.git.clone();

    if (result?.status === 'success' && result?.proceed?.data === true) {
      StorageOperations.saveProjectPath(result.path);
      StorageOperations.clearProjectData();
      return result.path;
    }
  } catch (error) {
    console.error('Clone handler error:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to clone repository: ${error.message}`,
      buttons: ['OK']
    });
  }
  return false;
};
