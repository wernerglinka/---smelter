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

        const processFiles = (data) => {
          const tree = { src: {} };
          const files = Object.values(data)[0];

          files.forEach((fileObj) => {
            if (Array.isArray(fileObj)) return;

            if (typeof fileObj === 'object' && fileObj !== null && !Object.keys(fileObj)[0].includes('.')) {
              const folderName = Object.keys(fileObj)[0];
              const folderContents = fileObj[folderName];

              if (Array.isArray(folderContents)) {
                folderContents.forEach(file => {
                  const [filename, filepath] = Object.entries(file)[0];
                  if (filename.endsWith('.md')) {
                    if (!tree.src[folderName]) {
                      tree.src[folderName] = {};
                    }
                    tree.src[folderName][filename] = filepath;
                  }
                });
              }
              return;
            }

            const [filename, filepath] = Object.entries(fileObj)[0];
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
