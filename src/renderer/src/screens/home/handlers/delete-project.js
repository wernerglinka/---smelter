// screens/home/handlers/delete-project.js
import { StorageOperations } from '../../../services/storage';

export const handleDeleteProject = async (e) => {
  e.preventDefault();

  try {
    const { status, data } = await window.electronAPI.dialog.selectDirectory();

    if (status === 'success' && data) {
      const projectFolder = data;

      // Verify .metallurgy exists BEFORE doing anything else
      const { status: existsStatus } = await window.electronAPI.directories.exists(
        `${projectFolder}/.metallurgy`
      );

      if (existsStatus !== 'success') {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'This folder is not a valid project - .metallurgy folder not found!',
          buttons: ['OK']
        });
        return;
      }

      const projectName = StorageOperations.getProjectName(projectFolder);
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'question',
        message: `Are you sure you want to delete ${projectName}?`,
        buttons: ['Yes', 'No']
      });

      if (response === 1) return;

      const { status: deleteStatus } = await window.electronAPI.directories.delete(projectFolder);

      if (deleteStatus === 'success') {
        StorageOperations.clearProjectData();

        await window.electronAPI.dialog.showCustomMessage({
          type: 'info',
          message: `Project ${projectName} deleted successfully`,
          buttons: ['OK']
        });
      }
    }
  } catch (error) {
    console.error('Error in delete process:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to delete project: ${error.message}`,
      buttons: ['OK']
    });
  }
};
