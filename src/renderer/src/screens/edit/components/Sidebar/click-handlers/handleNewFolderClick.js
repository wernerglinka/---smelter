import { StorageOperations } from '@services/storage';

/**
 * Handles the creation of a new folder in the project structure
 *
 * @param {string} activeFolder - The currently active folder path where the new folder will be created
 * @returns {Promise<void>}
 *
 * The function:
 * 1. Gets the project paths from storage (project root, content, and data paths)
 * 2. Prompts user for folder name via dialog
 * 3. Determines correct base path based on whether we're in content or data directory
 * 4. Creates folder in filesystem at the appropriate location
 * 5. Dispatches 'folderCreated' event to update UI
 *
 * @throws {Error} If required paths are not found or folder creation fails
 */
export const handleNewFolderClick = async (activeFolder) => {
  if (!activeFolder) return;

  try {
    // Get all required paths from storage
    const projectPath = StorageOperations.getProjectPath();
    const contentPath = StorageOperations.getContentPath();
    const dataPath = StorageOperations.getDataPath();

    if (!projectPath || !contentPath || !dataPath) {
      throw new Error('Required paths not found in storage');
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

    // Determine the base path and relative path based on the active folder
    // If we're in the data directory, use dataPath as base
    // If we're in the content directory, use contentPath as base
    let basePath;
    let relativePath;

    if (activeFolder.startsWith('data')) {
      basePath = dataPath;
      // Remove 'data' prefix to get relative path
      relativePath = activeFolder.replace('data', '');
    } else {
      basePath = contentPath;
      // Remove 'src' prefix to get relative path
      relativePath = activeFolder.replace('src', '');
    }

    // Create full folder path by combining base path and relative path
    // Clean up any double slashes that might occur during path combination
    const folderPath = `${basePath}${relativePath}/${response.value}`.replace(/\/+/g, '/');

    // Check if folder already exists to prevent overwriting
    const existsResponse = await window.electronAPI.directories.exists(folderPath);
    if (existsResponse && existsResponse.data === true) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: 'A folder with this name already exists.',
        buttons: ['OK']
      });
      return;
    }

    // Create the folder in the filesystem
    const result = await window.electronAPI.directories.create(folderPath);

    if (result.status === 'success') {
      // Dispatch event to trigger UI update
      window.dispatchEvent(
        new CustomEvent('folderCreated', {
          detail: { path: folderPath }
        })
      );
    } else {
      throw new Error(result.error || 'Failed to create folder');
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    // Show error message to user
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to create folder: ${error.message}`,
      buttons: ['OK']
    });
  }
};
