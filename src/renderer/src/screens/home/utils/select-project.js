/**
 * @typedef {Object} DialogResult
 * @property {string} status - Response status
 * @property {Object} data - Dialog response data
 * @property {boolean} data.canceled - Whether dialog was canceled
 * @property {string[]} data.filePaths - Selected file paths
 */

/**
 * Dialog configuration for project folder selection
 */
const DIALOG_CONFIG = {
  title: 'Select Project Folder',
  message: 'Choose a folder for your project',
  properties: ['openDirectory'],
  buttonLabel: 'Select Project Folder'
};

/**
 * Validates dialog result structure
 * @param {DialogResult} result - Dialog response
 * @returns {string|null} Selected path or null if canceled
 */
const validateDialogResult = (result) => {
  if (
    result?.status !== 'success' ||
    result.data?.canceled ||
    !Array.isArray(result.data?.filePaths) ||
    result.data.filePaths.length === 0
  ) {
    return null;
  }
  return result.data.filePaths[0];
};

/**
 * Validates selected path exists
 * @param {string} path - Path to validate
 * @throws {Error} If path doesn't exist
 */
const validatePath = async (path) => {
  const exists = await window.electronAPI.files.exists(path);
  if (!exists) {
    throw new Error('Selected folder does not exist');
  }
};

/**
 * Opens dialog for project folder selection
 * @returns {Promise<string|"abort">} Selected path or "abort" if canceled
 * @throws {Error} If folder selection fails
 */
export const selectProject = async () => {
  try {
    const result = await window.electronAPI.dialog.open('showOpenDialog', DIALOG_CONFIG);

    const selectedPath = validateDialogResult(result);
    if (!selectedPath) {
      return 'abort';
    }

    await validatePath(selectedPath);
    return selectedPath;
  } catch (error) {
    console.error('Error in selectProject:', error);
    throw new Error(`Failed to select project folder: ${error.message}`);
  }
};
