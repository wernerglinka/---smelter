import { StorageOperations } from '@utils/services/storage';

export const handleCloneGithub = async (e, navigate) => {
  if (e?.preventDefault) {
    e.preventDefault();
  }

  try {
    const result = await window.electronAPI.git.clone({});

    if (result?.status === 'success' && result?.proceed?.data === true) {
      const projectPath = result.path;

      // Clear any existing data first
      StorageOperations.clearProjectData();

      // Save only the project path for now
      StorageOperations.saveProjectPath(projectPath);

      navigate('/new');
    }
  } catch (error) {
    console.error('Error in clone operation:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to clone repository: ${error.message}`,
      buttons: ['OK']
    });
  }
};
