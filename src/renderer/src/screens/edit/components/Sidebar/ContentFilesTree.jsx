import React, { useState, useEffect } from 'react';
import { FileMdIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';
import { FileTreeBase } from './FileTree';

/**
 * Renders a tree structure of markdown content files with delete functionality.
 * Uses FileTreeBase for the actual tree rendering and handling file operations.
 *
 * @param {Object} props
 * @param {string} props.path - Base path for content files
 * @param {string} props.fileSelected - Currently selected file path
 * @param {Function} props.onFileSelect - Callback when a file is selected
 */
export const RenderContentFilesTree = ({
  path,
  fileSelected,
  onFileSelect,
  onFolderActivate,
  activeFolder, // Add this prop
  onFolderToggle,
  openFolders
}) => {
  // Track the processed file tree structure
  const [fileTree, setFileTree] = useState(null);
  // Track any errors during file operations
  const [error, setError] = useState(null);

  const loadFiles = async () => {
    try {
      // Get the content directory path from storage
      const contentPath = StorageOperations.getContentPath();
      if (!contentPath) {
        throw new Error('Content path not found in storage');
      }

      // Read the directory structure using electron API
      const { status, data, error } = await window.electronAPI.directories.read(contentPath);

      if (status === 'failure') {
        throw new Error(`Failed to read directory: ${error}`);
      }

      /**
       * Processes directory data into a structured tree format for markdown files.
       * Creates a hierarchical object with 'src' as the root, containing folders and files.
       *
       * @param {Object} data - Raw directory data from electronAPI.directories.read
       * @returns {Object} Structured tree with 'src' as root containing markdown files
       *
       * Example output:
       * {
       *   src: {
       *     'folder1': {
       *       'file1.md': '/path/to/file1.md',
       *       'file2.md': '/path/to/file2.md'
       *     },
       *     'file3.md': '/path/to/file3.md'
       *   }
       * }
       */
      const processFiles = (data) => {
        // Initialize tree structure with 'src' as root
        const tree = { src: {} };
        // Extract the files array from the first property of data object
        const files = Object.values(data)[0];

        files.forEach((fileObj) => {
          // Skip arrays (shouldn't occur in normal operation)
          if (Array.isArray(fileObj)) return;

          // Determine if current item is a folder
          const isFolder =
            typeof fileObj === 'object' &&
            fileObj !== null &&
            (Array.isArray(Object.values(fileObj)[0]) ||
              typeof Object.values(fileObj)[0] === 'object');

          if (isFolder) {
            // Process folder contents
            const folderName = Object.keys(fileObj)[0];
            const folderContents = fileObj[folderName];

            // Create folder in tree even if empty
            if (!tree.src[folderName]) {
              tree.src[folderName] = {};
            }

            // Process files within the folder if contents are in array format
            if (Array.isArray(folderContents)) {
              folderContents.forEach((file) => {
                // Each file is an object with one entry: { filename: filepath }
                const [filename, filepath] = Object.entries(file)[0];
                // Only process markdown files
                if (filename.endsWith('.md')) {
                  tree.src[folderName][filename] = filepath;
                }
              });
            }
            return;
          }

          // Process files at root level
          const [filename, filepath] = Object.entries(fileObj)[0];
          // Only include markdown files
          if (filename.endsWith('.md')) {
            tree.src[filename] = filepath;
          }
        });

        return tree;
      };

      const processedTree = processFiles(data);
      setFileTree(processedTree);
    } catch (err) {
      setError(err.message);
      console.error('Error loading files:', err);
    }
  };

  useEffect(() => {
    const handleFileCreated = () => {
      loadFiles();
    };
    const handleFileDeleted = () => {
      loadFiles();
    };
    const handleFolderCreated = () => {
      loadFiles();
    };
    const handleFolderDeleted = (event) => {
      // Reload files only if the deleted folder was in our content path
      const contentPath = StorageOperations.getContentPath();
      if (event.detail.path.startsWith(contentPath)) {
        loadFiles();
      }
    };

    window.addEventListener('fileCreated', handleFileCreated);
    window.addEventListener('fileDeleted', handleFileDeleted);
    window.addEventListener('folderCreated', handleFolderCreated);
    window.addEventListener('folderDeleted', handleFolderDeleted);

    loadFiles();

    return () => {
      window.removeEventListener('fileCreated', handleFileCreated);
      window.removeEventListener('fileDeleted', handleFileDeleted);
      window.removeEventListener('folderCreated', handleFolderCreated);
      window.removeEventListener('folderDeleted', handleFolderDeleted);
    };
  }, []);

  if (error) {
    return <div className="error">Error loading files: {error}</div>;
  }

  return (
    <FileTreeBase
      fileTree={fileTree}
      fileSelected={fileSelected}
      onFileClick={onFileSelect}
      fileType="md"
      FileIcon={FileMdIcon}
      onFolderActivate={onFolderActivate}
      activeFolder={activeFolder}
      onFolderToggle={onFolderToggle}
      openFolders={openFolders}
    />
  );
};
