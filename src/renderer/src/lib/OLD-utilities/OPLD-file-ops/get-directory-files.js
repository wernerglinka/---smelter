import { StorageOperations } from '@utils/services/storage';
import { createDomTree } from '../../../screens/lib/page-elements/create-dom-tree.js';

/**
 * Gets directory files and renders a DOM tree representation
 * @param {string} directoryKey - Key to fetch directory path from storage
 * @returns {Promise<void>}
 * @throws {Error} If directory read fails or DOM elements not found
 */
export const getDirectoryFiles = async (directoryKey) => {
  try {
    // Get folder path
    const folderPath =
      directoryKey === 'contentFolder'
        ? StorageOperations.getContentPath()
        : StorageOperations.getDataPath();

    if (!folderPath) {
      console.warn(`No folder path found for key: ${directoryKey}`);
      return;
    }

    // Get the directory file list
    const { status, data, error } = await window.electronAPI.directories.read(folderPath);

    if (status === 'failure') {
      throw new Error(`Failed to read directory: ${error}`);
    }

    // Create the dom tree from the directory file list
    const domTree = createDomTree(data);
    domTree.classList.add('dom-tree', 'js-dom-tree', 'js-files-list');

    // Add the dom tree to the folder ui
    const sidebar = document.querySelector('.js-dom-tree-wrapper');
    if (!sidebar) {
      console.warn('Sidebar element not found');
      return;
    }

    sidebar.appendChild(domTree);
  } catch (error) {
    console.error('Error in getDirectoryFiles:', error);
    throw error;
  }
};
