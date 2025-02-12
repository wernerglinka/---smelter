import { StorageOperations } from '@services/storage';

export const handleNewFolderClick = async (activeFolder) => {
  try {
    // Get project path from storage
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) {
      throw new Error('Project path not found in storage');
    }

    // Show dialog to get folder name
    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'custom',
      message: 'Enter folder name:',
      buttons: ['Create', 'Cancel'],
      input: true
    });

    // User cancelled or clicked Cancel
    if (!response || response.index === 1 || !response.value) return;

    // Create full folder path using project path
    const folderPath = `${projectPath}/${activeFolder}/${response.value}`;

    // Check if folder already exists
    const existsResponse = await window.electronAPI.directories.exists(folderPath);
    if (existsResponse && existsResponse.data === true) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: 'A folder with this name already exists.',
        buttons: ['OK']
      });
      return;
    }

    // Create folder
    const result = await window.electronAPI.directories.create(folderPath);

    if (result.status === 'success') {
      window.dispatchEvent(
        new CustomEvent('folderCreated', {
          detail: { path: folderPath }
        })
      );
    } else {
      throw new Error(`Failed to create folder: ${result.error}`);
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to create folder: ${error.message}`,
      buttons: ['OK']
    });
  }
};
