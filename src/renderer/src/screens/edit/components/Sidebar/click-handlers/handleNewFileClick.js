import { StorageOperations } from '@services/storage';

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
    // Get project path from storage
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) {
      throw new Error('Project path not found in storage');
    }

    // Show dialog to get file name
    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'custom',
      message: 'Enter file name:',
      buttons: ['Create', 'Cancel'],
      input: true
    });

    // User cancelled or clicked Cancel
    if (!response || response.index === 1 || !response.value) return;

    // Create full file path
    const fileName = response.value.endsWith(`.${extension}`)
      ? response.value
      : `${response.value}.${extension}`;
    const filePath = `${projectPath}/${activeFolder}/${fileName}`;

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

    // Create initial content based on file type
    const initialContent = '';

    // Write file
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
    console.error('Error in handleNewFileClick:', error);
    console.error('Error stack:', error.stack);
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to create file: ${error.message}`,
      buttons: ['OK']
    });
  }
};
