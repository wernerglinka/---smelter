import React, { useState } from 'react';
import { FolderIcon } from '@components/icons';

// Base component with shared tree rendering logic
export const FileTreeBase = ({
  fileTree,
  fileSelected,
  onFileClick,
  fileType,
  FileIcon
}) => {
  // Initialize with empty Set instead of having 'src' open
  const [openFolders, setOpenFolders] = useState(new Set());

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

  const renderTreeNode = (node, path = '') => {
    const entries = Object.entries(node);
    const files = entries.filter(([_, value]) => typeof value === 'string');
    const folders = entries.filter(([_, value]) => typeof value === 'object' && !Array.isArray(value));

    files.sort(([a], [b]) => a.localeCompare(b));
    folders.sort(([a], [b]) => a.localeCompare(b));

    return [
      // Files first
      ...files.map(([key, value]) => {
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
          </li>
        );
      }),

      // Then folders
      ...folders.map(([key, value]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const hasFiles = Object.keys(value).length > 0;
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
    ].filter(Boolean);
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
