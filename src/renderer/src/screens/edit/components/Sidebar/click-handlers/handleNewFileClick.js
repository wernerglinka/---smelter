import { StorageOperations } from '@utils/services/storage';
import { logger } from '@utils/services/logger';

/**
 * Handles the creation of a new file in the project structure
 *
 * @param {string} extension - File extension (.md or .json)
 * @param {string} activeFolder - The currently active folder path where the new file will be created
 * @param {Function} handleFileSelect - Callback to select the newly created file
 * @param {Function} setFileSelected - State setter for the selected file
 * @returns {Promise<void>}
 *
 * The function:
 * 1. Gets the project root path from storage
 * 2. Prompts user for file name via dialog
 * 3. Creates file in filesystem with appropriate initial content
 * 4. Dispatches 'fileCreated' event to update UI
 * 5. Selects the newly created file
 *
 * @throws {Error} If project path is not found or file creation fails
 */
export const handleNewFileClick = async (
  extension,
  activeFolder,
  handleFileSelect,
  setFileSelected
) => {
  if (!activeFolder) return;

  try {
    // Get all required paths from storage
    const projectPath = StorageOperations.getProjectPath();
    const contentPath = StorageOperations.getContentPath();
    const dataPath = StorageOperations.getDataPath();

    if (!projectPath || !contentPath || !dataPath) {
      throw new Error('Required paths not found in storage');
    }

    // Show dialog to get file name
    const fileTypeDisplay = extension === '.md' ? 'Markdown' : 'JSON';

    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'custom',
      message: `Enter file name for your new ${fileTypeDisplay} file (${extension} will be added automatically):`,
      buttons: ['Create', 'Cancel'],
      input: true
    });

    // User cancelled or clicked Cancel
    if (!response || response.index === 1 || !response.value) return;

    // clean file name input by discarding any extension that user might have added
    const fileName = response.value.split('.')[0];

    // Determine the base path and relative path based on the active folder
    // Extract folder names from the content and data paths
    const contentFolderName = contentPath.split('/').pop();
    const dataFolderName = dataPath.split('/').pop();

    // Log the extracted folder names for debugging
    logger.debug('File path determination:', {
      contentFolderName,
      dataFolderName,
      activeFolder
    });

    let basePath;
    let relativePath;

    // Check if the active folder starts with the data folder name
    if (activeFolder.startsWith(dataFolderName)) {
      basePath = dataPath;
      // Remove data folder name prefix to get relative path
      relativePath = activeFolder.replace(dataFolderName, '');
    }
    // Check if active folder starts with content folder name
    else if (activeFolder.startsWith(contentFolderName)) {
      basePath = contentPath;
      // Remove content folder name prefix to get relative path
      relativePath = activeFolder.replace(contentFolderName, '');
    }
    // Fallback to checking for hardcoded 'data' or 'src' prefixes
    else if (activeFolder.startsWith('data')) {
      basePath = dataPath;
      relativePath = activeFolder.replace('data', '');
    } else {
      basePath = contentPath;
      relativePath = activeFolder.replace('src', '');
    }

    // Files should be empty so users can drag fields into them
    const initialContent = '';

    // Create full folder path by combining base path and relative path
    // Clean up any double slashes that might occur during path combination
    const filePath = `${basePath}${relativePath}/${fileName}${extension}`.replace(/\/+/g, '/');

    // Check if file already exists
    const existsResponse = await window.electronAPI.files.exists(filePath);
    if (existsResponse && existsResponse.data === true) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: 'A file with this name already exists.',
        buttons: ['OK']
      });
      return;
    }

    // Write file with the prepared initial content
    const writeResult = await window.electronAPI.files.write({
      obj: initialContent,
      path: filePath,
      raw: true
    });

    if (writeResult.status === 'success') {
      window.dispatchEvent(
        new CustomEvent('fileCreated', {
          detail: { path: filePath }
        })
      );

      // Select the newly created file
      handleFileSelect(filePath);
      setFileSelected(filePath);
    } else {
      throw new Error(`Failed to create file: ${writeResult.error}`);
    }
  } catch (error) {
    logger.error('Error in handleNewFileClick:', {
      message: error.message,
      stack: error.stack
    });
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to create file: ${error.message}`,
      buttons: ['OK']
    });
  }
};