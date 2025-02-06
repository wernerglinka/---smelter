import React, { useState, useEffect } from 'react';
import { FileJsonIcon } from '../../../../components/icons';
import { StorageOperations } from '../../../../services/storage';
import { FileTreeBase } from './FileTree';

export const RenderDataFilesTree = ({ path, fileSelected, onFileSelect }) => {
  const [fileTree, setFileTree] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        const processFiles = (data) => {
          const tree = { data: {} };
          const files = Object.values(data)[0];

          files.forEach((fileObj) => {
            if (Array.isArray(fileObj)) return;

            if (typeof fileObj === 'object' && fileObj !== null && !Object.keys(fileObj)[0].includes('.')) {
              const folderName = Object.keys(fileObj)[0];
              const folderContents = fileObj[folderName];

              if (Array.isArray(folderContents)) {
                folderContents.forEach(file => {
                  const [filename, filepath] = Object.entries(file)[0];
                  if (filename.endsWith('.json')) {
                    if (!tree.data[folderName]) {
                      tree.data[folderName] = {};
                    }
                    tree.data[folderName][filename] = filepath;
                  }
                });
              }
              return;
            }

            const [filename, filepath] = Object.entries(fileObj)[0];
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
      fileType="json"
      FileIcon={FileJsonIcon}
    />
  );
};