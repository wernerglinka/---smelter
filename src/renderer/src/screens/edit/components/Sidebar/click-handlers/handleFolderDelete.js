import { StorageOperations } from '@services/storage';

/**
 * Handles folder deletion with user confirmation
 * When a folder is deleted, the FileTreeBase component:
 *  - Handles the deletion via handleFolderDelete
 *  - Dispatches the 'folderDeleted' event
 *  - The UI updates to remove just the deleted folder, including all its files
 * The folder structure and state (open) is preserved because:
 *  - The openFolders state in FileTreeBase is independent of the file list
 *  - The deletion event only triggers a re-render of the file tree
 *  - Other folders open/closed state aren't affected by the folder deletion
 *
 * @param {string} folderPath - Path of folder to delete
 * @param {string} fileSelected - Currently selected file path
 * @param {Function} onFileClick - Callback when a file is clicked
 */
export const handleFolderDelete = async (folderPath, fileSelected, onFileClick) => {
  try {
    // Get the root path based on whether this is in content or data directory
    const rootPath = folderPath.startsWith('src')
      ? StorageOperations.getContentPath()
      : StorageOperations.getDataPath();

    if (!rootPath) {
      throw new Error('Could not determine root path for folder');
    }

    // Remove the 'src/' or 'data/' prefix from the folderPath
    const relativePath = folderPath.replace(/^(src|data)\//, '');

    // Convert relative path to absolute path
    const absolutePath = `${rootPath}/${relativePath}`;

    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'question',
      message: `Are you sure you want to delete ${folderPath}?`,
      buttons: ['Yes', 'No']
    });

    if (!response || response.index === 1) {
      return;
    }

    const result = await window.electronAPI.directories.delete(absolutePath);

    if (result.status === 'success') {
      if (result.data?.includes('does not exist')) {
        throw new Error('Directory does not exist');
      }

      if (fileSelected === folderPath) {
        onFileClick(null);
      }
      window.dispatchEvent(
        new CustomEvent('folderDeleted', {
          detail: { path: absolutePath }
        })
      );
    } else {
      throw new Error(`Failed to delete folder: ${result.error}`);
    }
  } catch (error) {
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to delete folder: ${error.message}`,
      buttons: ['OK']
    });
  }
};
