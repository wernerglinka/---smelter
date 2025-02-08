import React, { useState, useEffect } from 'react';
import { FileMdIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';
import { FileTreeBase } from './FileTree';

export const RenderContentFilesTree = ({ path, fileSelected, onFileSelect }) => {
  const [fileTree, setFileTree] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const contentPath = StorageOperations.getContentPath();
        if (!contentPath) {
          throw new Error('Content path not found in storage');
        }

        const { status, data, error } = await window.electronAPI.directories.read(contentPath);

        if (status === 'failure') {
          throw new Error(`Failed to read directory: ${error}`);
        }

        /**
         * Processes directory data into a structured tree format for markdown files
         * @param {Object} data - Raw directory data from electronAPI.directories.read
         * @returns {Object} Structured tree with 'src' as root containing markdown files
         */
        const processFiles = (data) => {
          // Initialize tree structure with 'src' as root
          const tree = { src: {} };
          // Extract the files array from the first (and only) property of data object
          const files = Object.values(data)[0];

          files.forEach((fileObj) => {
            // Skip if fileObj is an array (shouldn't occur in normal operation)
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
              // Extract folder name and its contents
              const folderName = Object.keys(fileObj)[0];
              const folderContents = fileObj[folderName];

              // Process files within the folder if contents are in array format
              if (Array.isArray(folderContents)) {
                folderContents.forEach(file => {
                  // Each file is an object with one entry: { filename: filepath }
                  const [filename, filepath] = Object.entries(file)[0];
                  // Only process markdown files
                  if (filename.endsWith('.md')) {
                    // Create folder in tree if it doesn't exist
                    if (!tree.src[folderName]) {
                      tree.src[folderName] = {};
                    }
                    // Add file to folder in tree
                    tree.src[folderName][filename] = filepath;
                  }
                });
              }
              return;
            }

            // Process files at root level
            // Each fileObj is { filename: filepath }
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

    loadFiles();
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
    />
  );
};
