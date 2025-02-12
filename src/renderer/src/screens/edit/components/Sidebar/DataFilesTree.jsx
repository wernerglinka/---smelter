import React, { useState, useEffect } from 'react';
import { FileJsonIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';
import { FileTreeBase } from './FileTree';

export const RenderDataFilesTree = ({ path, fileSelected, onFileSelect }) => {
  const [fileTree, setFileTree] = useState(null);
  const [error, setError] = useState(null);

  const loadFiles = async () => {
    try {
      const dataPath = StorageOperations.getDataPath();
      if (!dataPath) {
        throw new Error('Data path not found in storage');
      }

      const { status, data, error } = await window.electronAPI.directories.read(dataPath);

      if (status === 'failure') {
        throw new Error(`Failed to read directory: ${error}`);
      }

      /**
       * Processes directory data into a structured tree format for JSON files.
       * Creates a hierarchical object with 'data' as the root, containing folders and files.
       *
       * @param {Object} data - Raw directory data from electronAPI.directories.read
       * @returns {Object} Structured tree with 'data' as root containing JSON files
       *
       * Example output:
       * {
       *   data: {
       *     'folder1': {
       *       'file1.json': '/path/to/file1.json',
       *       'file2.json': '/path/to/file2.json'
       *     },
       *     'file3.json': '/path/to/file3.json'
       *   }
       * }
       */
      const processFiles = (data) => {
        // Initialize tree structure with 'data' as root
        const tree = { data: {} };
        // Extract the files array from the first property of data object
        const files = Object.values(data)[0];

        files.forEach((fileObj) => {
          // Skip arrays (shouldn't occur in normal operation)
          if (Array.isArray(fileObj)) return;

          // Determine if current item is a folder by checking:
          // 1. If it's an object
          // 2. If it's not null
          // 3. If its first value is either an array or object (indicating nested content)
          const isFolder = typeof fileObj === 'object' &&
            fileObj !== null &&
            (Array.isArray(Object.values(fileObj)[0]) ||
            typeof Object.values(fileObj)[0] === 'object');

          if (isFolder) {
            // Process folder contents
            const folderName = Object.keys(fileObj)[0];
            const folderContents = fileObj[folderName];

            // Process files within the folder if contents are in array format
            if (Array.isArray(folderContents)) {
              folderContents.forEach(file => {
                // Each file is an object with one entry: { filename: filepath }
                const [filename, filepath] = Object.entries(file)[0];
                // Only process JSON files
                if (filename.endsWith('.json')) {
                  // Create folder in tree if it doesn't exist
                  if (!tree.data[folderName]) {
                    tree.data[folderName] = {};
                  }
                  // Add file to folder in tree
                  tree.data[folderName][filename] = filepath;
                }
              });
            }
            return;
          }

          // Process files at root level
          const [filename, filepath] = Object.entries(fileObj)[0];
          // Only include JSON files
          if (filename.endsWith('.json')) {
            tree.data[filename] = filepath;
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

    window.addEventListener('fileCreated', handleFileCreated);
    window.addEventListener('fileDeleted', handleFileDeleted);
    window.addEventListener('folderCreated', handleFolderCreated);
    loadFiles();

    return () => {
      window.removeEventListener('fileCreated', handleFileCreated);
      window.removeEventListener('fileDeleted', handleFileDeleted);
      window.removeEventListener('folderCreated', handleFolderCreated);
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
      fileType="json"
      FileIcon={FileJsonIcon}
    />
  );
};
