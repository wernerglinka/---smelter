import React, { useState, useEffect, useCallback, memo } from 'react';
import { FolderIcon, FolderOpenIcon, MinusIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';

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
export const FileTreeBase = memo(({
  fileTree,
  fileSelected,
  onFileClick,
  fileType,
  FileIcon,
  onFolderActivate,
  activeFolder
}) => {
  const [ openFolders, setOpenFolders ] = useState( new Set() );

  // Add this near the top of your FileTreeBase component
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Option key (Alt on Mac) or Alt on Windows
      if (e.altKey) {
        console.log('Option/Alt key pressed - showing delete buttons');
        document.body.classList.add('option-pressed');
      }
    };

    const handleKeyUp = (e) => {
      if (!e.altKey) {
        console.log('Option/Alt key released - hiding delete buttons');
        document.body.classList.remove('option-pressed');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.body.classList.remove('option-pressed');
    };
  }, []);

  // Get the root folder names from storage, with null check
  const contentRoot = fileTree ? Object.keys(fileTree).find(key =>
    StorageOperations.getContentPath()?.includes(key)
  ) : null;

  const dataRoot = fileTree ? Object.keys(fileTree).find(key =>
    StorageOperations.getDataPath()?.includes(key)
  ) : null;

  const handleFolderClick = useCallback((folderPath, e) => {
    // If Control/Command key is pressed, ONLY handle folder activation
    if (e.ctrlKey || e.metaKey) {
      onFolderActivate?.(folderPath === activeFolder ? null : folderPath);
      return;
    }

    // Regular click ONLY handles open/close
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = new Set(prevOpenFolders);
      if (newOpenFolders.has(folderPath)) {
        newOpenFolders.delete(folderPath);
      } else {
        newOpenFolders.add(folderPath);
      }
      return newOpenFolders;
    });
  }, [activeFolder, onFolderActivate]);

  /**
   * Handles file deletion with user confirmation
   * When a file is deleted, the  FileTreeBase component:
   *  - Handles the deletion via  handleFileDelete
   *  - Dispatches the 'fileDeleted' event
   *  - The UI updates to remove just the deleted file
   * The folder structure and state (open) is preserved because:
   *  - The  openFolders state in  FileTreeBase is independent of the file list
   *  - The deletion event only triggers a re-render of the file tree
   *  - The folder open/closed state isn't affected by the file deletion
   *
   * @param {string} filepath - Path of file to delete
   */
  const handleFileDelete = useCallback(async (filepath) => {
    try {
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'question',
        message: `Are you sure you want to delete ${filepath}?`,
        buttons: ['Yes', 'No']
      });

      if (!response || response.index === 1) return;

      const result = await window.electronAPI.files.delete(filepath);

      if (result.status === 'success') {
        if (fileSelected === filepath) {
          onFileClick(null);
        }
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
  }, [ fileSelected, onFileClick ] );

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
   */
  const handleFolderDelete = useCallback(async (folderPath) => {
    console.log('handleFolderDelete called with path:', folderPath);
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
      console.log('Root path:', rootPath);
      console.log('Relative path:', relativePath);
      console.log('Absolute path for deletion:', absolutePath);

      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'question',
        message: `Are you sure you want to delete ${folderPath}?`,
        buttons: ['Yes', 'No']
      });

      if (!response || response.index === 1) {
        console.log('User cancelled deletion');
        return;
      }

      console.log('Attempting to delete folder:', absolutePath);
      const result = await window.electronAPI.directories.delete(absolutePath);
      console.log('Delete result:', result);

      if (result.status === 'success') {
        if (result.data?.includes('does not exist')) {
          throw new Error('Directory does not exist');
        }

        console.log('Delete successful, dispatching event');
        if (fileSelected === folderPath) {
          console.log('Clearing file selection');
          onFileClick(null);
        }
        window.dispatchEvent(new CustomEvent('folderDeleted', {
          detail: { path: absolutePath }
        }));
      } else {
        throw new Error(`Failed to delete folder: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in handleFolderDelete:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to delete folder: ${error.message}`,
        buttons: ['OK']
      });
    }
  }, [fileSelected, onFileClick]);

  /**
   * Recursively renders the tree structure
   *
   * @param {Object} node - Current node in the file tree
   * @param {string} path - Current path in the tree hierarchy
   * @returns {Array} Array of rendered file and folder elements
   */
  const renderTreeNode = useCallback((node, path = '') => {
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
              className="delete-wrapper"><MinusIcon />
            </span>
          </li>
        );
      }),

      // Then render folders (including empty ones)
      ...folders.map(([key, value]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const isOpen = openFolders.has(currentPath);
        const isActive = currentPath === activeFolder;

        // Only show delete icon for folders INSIDE content or data roots, not the root folders themselves
        const showDelete = path && (
          (contentRoot && path.startsWith(contentRoot)) ||
          (dataRoot && path.startsWith(dataRoot))
        );

        return (
          <li key={ key } className={ `folder ${ isOpen ? 'open' : '' } ${ isActive ? 'active' : '' }` }>
            <span className="folder-name-wrapper">
              <a
                className="folder-name"
                onClick={(e) => {
                  e.preventDefault();
                  handleFolderClick(currentPath, e);
                }}
              >
                {isOpen ? <FolderOpenIcon /> : <FolderIcon />}
                {key}
              </a>
              {showDelete && (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Delete folder button clicked for path:', currentPath);
                    handleFolderDelete(currentPath);
                  }}
                  className="delete-wrapper"
                >
                  <MinusIcon />
                </span>
              )}
            </span>
            <ul className="folder-content">
              {renderTreeNode(value, currentPath)}
            </ul>
          </li>
        );
      })
    ].filter(Boolean); // Remove null entries
  }, [fileType, fileSelected, onFileClick, handleFileDelete, handleFolderDelete, openFolders, activeFolder, handleFolderClick, contentRoot, dataRoot]);

  if (!fileTree) {
    return <div>Loading...</div>;
  }

  return (
    <div className="file-tree">
      <ul className="dom-tree">
        {renderTreeNode(fileTree)}
      </ul>
    </div>
  );
});

FileTreeBase.displayName = 'FileTreeBase';
