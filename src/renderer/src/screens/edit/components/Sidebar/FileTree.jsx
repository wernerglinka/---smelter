import React, { useState } from 'react';
import { FolderIcon, MinusIcon } from '@components/icons';

/**
 * Base component for rendering file tree structures. Used by both ContentFilesTree
 * and DataFilesTree to display markdown and data files respectively.
 *
 * @param {Object} props
 * @param {Object} props.fileTree - Hierarchical object representing the file/folder structure
 * @param {string} props.fileSelected - Path of currently selected file
 * @param {Function} props.onFileClick - Callback when a file is clicked
 * @param {string} props.fileType - File extension to filter by (e.g., 'md' or 'json')
 * @param {Component} props.FileIcon - Icon component to display next to files
 */
export const FileTreeBase = ({
  fileTree,
  fileSelected,
  onFileClick,
  fileType,
  FileIcon
}) => {
  // Track which folders are expanded/collapsed
  const [openFolders, setOpenFolders] = useState(new Set());

  /**
   * Handles file deletion with user confirmation
   * When a file is deleted, the  FileTreeBase component:
   *  - Handles the deletion via  handleFileDelete
   *  - Dispatches the 'fileDeleted' event
   *  - The UI updates to remove just the deleted file
   * The folder structure and state (open) is preserved because:
   *  - The  openFolders state in  FileTreeBase is independent of the file list
   *  - The deletion event only triggers a re-render of the file list
   *  - The folder open/closed state isn't affected by the file deletion
   *
   * @param {string} filepath - Path of file to delete
   */
  const handleFileDelete = async (filepath) => {
    try {
      // Show confirmation dialog
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'question',
        message: `Are you sure you want to delete ${filepath}?`,
        buttons: ['Yes', 'No']
      });

      // User cancelled or clicked No
      if (!response || response.index === 1) return;

      const result = await window.electronAPI.files.delete(filepath);

      if (result.status === 'success') {
        // If deleted file was selected, clear selection by passing null
        if (fileSelected === filepath) {
          onFileClick(null);
        }

        // Notify parent components to refresh their file listings
        window.dispatchEvent(new CustomEvent('fileDeleted', {
          detail: { path: filepath }
        }));
      } else {
        throw new Error(`Failed to delete file: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to delete file: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  /**
   * Toggles folder open/closed state
   *
   * @param {string} folderPath - Path of folder to toggle
   */
  const handleFolderClick = (folderPath) => {
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = new Set(prevOpenFolders);
      if (newOpenFolders.has(folderPath)) {
        newOpenFolders.delete(folderPath);
      } else {
        newOpenFolders.add(folderPath);
      }
      return newOpenFolders;
    });
  };

  /**
   * Recursively renders the tree structure
   *
   * @param {Object} node - Current node in the file tree
   * @param {string} path - Current path in the tree hierarchy
   * @returns {Array} Array of rendered file and folder elements
   */
  const renderTreeNode = (node, path = '') => {
    const entries = Object.entries(node);
    // Separate files and folders for ordered rendering
    const files = entries.filter(([_, value]) => typeof value === 'string');
    const folders = entries.filter(([_, value]) => typeof value === 'object' && !Array.isArray(value));

    // Sort files and folders alphabetically
    files.sort(([a], [b]) => a.localeCompare(b));
    folders.sort(([a], [b]) => a.localeCompare(b));

    return [
      // Render files first
      ...files.map(([key, value]) => {
        // Only show files matching the specified type
        if (!key.endsWith(`.${fileType}`)) {
          return null;
        }

        return (
          <li key={key} className={`file ${fileType}`}>
            <a
              onClick={(e) => {
                e.preventDefault();
                onFileClick(value);
              }}
              className={fileSelected === value ? 'selected' : ''}
            >
              <FileIcon />
              {key}
            </a>
            <span
              onClick={(e) => {
                e.preventDefault();
                handleFileDelete(value)
              }}
              className="delete-wrapper"><MinusIcon /></span>
          </li>
        );
      }),

      // Then render folders
      ...folders.map(([key, value]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const hasFiles = Object.keys(value).length > 0;
        // Don't render empty folders
        if (!hasFiles) return null;

        const isOpen = openFolders.has(currentPath);

        return (
          <li key={key} className={`folder ${isOpen ? 'open' : ''}`}>
            <span
              className="folder-name"
              onClick={() => handleFolderClick(currentPath)}
            >
              <FolderIcon />
              {key}
            </span>
            <ul className="folder-content">
              {renderTreeNode(value, currentPath)}
            </ul>
          </li>
        );
      })
    ].filter(Boolean); // Remove null entries
  };

  if (!fileTree) {
    return <div>Loading...</div>;
  }

  return (
    <div className="file-tree">
      <ul className="dom-tree js-dom-tree js-files-list">
        {renderTreeNode(fileTree)}
      </ul>
    </div>
  );
};
