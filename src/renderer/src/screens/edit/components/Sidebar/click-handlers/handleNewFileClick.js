import { StorageOperations } from '@services/storage';

/**
 * Handles the "Add New File" click
 * Opens a dialog for the file name and creates the file
 * @param {string} extension - File extension (.md or .json)
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
    if (!response || response.index === 1 || !response.value) {
      return;
    }

    // Get the file name from dialog and add extension if needed
    let fileName = response.value;
    if (!fileName.endsWith(`.${extension}`)) {
      fileName = `${fileName}.${extension}`;
    }

    // Create full file path using project path
    const filePath = `${projectPath}/${activeFolder}/${fileName}`;

    // Check if file already exists
    const existsResponse = await window.electronAPI.files.exists(filePath);

    // If the file exists, show error and return
    if (existsResponse && existsResponse.data === true) {
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: 'A file with this name already exists.',
        buttons: ['OK']
      });
      return;
    }

    // Create empty file with appropriate initial content
    const initialContent = extension === 'json' ? '{}' : '';
    const writeResult = await window.electronAPI.files.write({
      obj: initialContent,
      path: filePath
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
