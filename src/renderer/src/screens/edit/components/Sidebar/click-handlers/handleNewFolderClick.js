import { StorageOperations } from '@services/storage';

export const handleNewFolderClick = async (activeFolder) => {
  try {
    // Show dialog to get folder name
    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'custom',
      message: 'Enter folder name:',
      buttons: ['Create', 'Cancel'],
      input: true
    });

    // User cancelled or clicked Cancel
    if (!response || response.index === 1 || !response.value) return;

    const folderPath = `${activeFolder}/${response.value}`;

    // Check if folder already exists
    const existsResponse = await window.electronAPI.directory.exists(folderPath);
    if (existsResponse && existsResponse.data === true) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: 'A folder with this name already exists.',
        buttons: ['OK']
      });
      return;
    }

    // Create folder
    const result = await window.electronAPI.directory.create(folderPath);

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
