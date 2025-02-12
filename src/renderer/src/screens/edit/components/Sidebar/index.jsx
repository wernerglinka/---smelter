import React, { useState, useCallback, memo } from 'react';
import './styles.css';
import { RenderContentFilesTree } from './ContentFilesTree';
import { RenderDataFilesTree } from './DataFilesTree';
import { FolderPlusIcon, FilePlusIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';
import { handleNewFileClick } from './click-handlers';

// Memoize the Sidebar component to prevent unnecessary re-renders
const Sidebar = memo(({ path, className = '', onFileSelect, onFileDelete }) => {
  const [activePane, setActivePane] = useState('select-file');
  const [fileSelected, setFileSelected] = useState(null);
  const [openFolders, setOpenFolders] = useState(() => new Set());
  const [activeFolder, setActiveFolder] = useState('');
  const [activeFileExtension, setActiveFileExtension] = useState('.md'); // Default to .md

  const handleFolderToggle = useCallback((folderPath) => {
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = new Set(prevOpenFolders);
      if (newOpenFolders.has(folderPath)) {
        newOpenFolders.delete(folderPath);
      } else {
        newOpenFolders.add(folderPath);
      }
      return newOpenFolders;
    });
  }, []);

  const handleFileSelect = useCallback((filepath) => {
    setFileSelected(filepath);
    onFileSelect(filepath);
  }, [onFileSelect]);

  /**
   * Handles switching between different sidebar panes
   * @param {string} pane - Pane identifier to switch to
   */
  const handleTabClick = (pane) => {
    setActivePane(pane);
  };



  /**
   * Handles the "Add New Folder" click
   * Opens a dialog for the folder name and creates the folder
   */
  const handleNewFolderClick = async () => {
    if (!activeFolder) return;

    try {
      // Show dialog to get folder name
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'custom',
        message: 'Enter folder name:',
        buttons: ['Create', 'Cancel'],
        input: true
      });

      // User cancelled or clicked Cancel
      if (!response || response.index === 1 || !response.value) return;

      const folderPath = `${activeFolder}/${response.value}`;

      // Check if folder already exists
      const { status: existsStatus } = await window.electronAPI.directories.exists(folderPath);
      if (existsStatus === 'success') {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'A folder with this name already exists.',
          buttons: ['OK']
        });
        return;
      }

      // Create folder
      const result = await window.electronAPI.directories.create(folderPath);

      if (result.status === 'success') {
        // Notify parent components to refresh their file listings
        window.dispatchEvent(new CustomEvent('folderCreated', {
          detail: { path: folderPath }
        }));
      } else {
        throw new Error(`Failed to create folder: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to create folder: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  // Add handler to receive active folder updates from FileTreeBase
  const handleFolderActivate = (folderPath, extension) => {
    setActiveFolder(folderPath);
    // Use the extension to determine which new file/folder buttons to enable
    setActiveFileExtension(extension);
  };

  return (
    <div className={`sidebar ${className}`}>
      {/* Sidebar Header with Tab Navigation */}
      <div className="container-background">
        <ul className="sidebar-pane-selection">
          {/* File Selection Tab */}
          <li>
            <button
              className={`btn ${activePane === 'select-file' ? 'active' : ''}`}
              onClick={() => handleTabClick('select-file')}
            >
              Select Files
            </button>
          </li>
          {/* Add Field Tab - Disabled until file is selected */}
          <li className="select-file">
            <button
              className={`btn ${activePane === 'add-field' ? 'active' : ''}`}
              onClick={() => handleTabClick('add-field')}
              disabled={!fileSelected}
            >
              Add Field
            </button>
          </li>
          {/* Add Template Tab - Disabled until file is selected */}
          <li className="select-file">
            <button
              className={`btn ${activePane === 'add-template' ? 'active' : ''}`}
              onClick={() => handleTabClick('add-template')}
              disabled={!fileSelected}
            >
              Add Template
            </button>
          </li>
        </ul>
      </div>

      {/* Sidebar Content Area */}
      <div className="sidebar-panes">
        {/* File Selection Pane */}
        {activePane === 'select-file' && (
          <div className="sidebar-pane active">
            {/* Hint text shown when no file is selected */}
            <div className="sidebar-hint container-background">
              <p>Select a file to start editing...</p>
            </div>
            {/* File Tree Container */}
            <div className="container-background">
              <h3>Project Files</h3>

              {/* New File/Folder Creation Button */}
              <ul className="add-new">
                <li
                  className={!activeFolder ? 'disabled' : ''}
                  onClick={activeFolder ? handleNewFolderClick : undefined}
                >
                  <FolderPlusIcon />
                </li>
                <li
                  className={!activeFolder ? 'disabled' : ''}
                  onClick={activeFolder ? () => handleNewFileClick(activeFileExtension, activeFolder, handleFileSelect, setFileSelected) : undefined}
                >
                  <FilePlusIcon />
                </li>
              </ul>

              {/* Content Files Tree */}
              <RenderContentFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
                openFolders={openFolders}
                onFolderToggle={handleFolderToggle}
                onFolderActivate={handleFolderActivate}
              />

              {/* Data Files Tree */}
              <RenderDataFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
                openFolders={openFolders}
                onFolderToggle={handleFolderToggle}
                onFolderActivate={handleFolderActivate}
              />
            </div>
          </div>
        )}
        {/* Note: Add Field and Add Template panes are conditionally rendered
            based on activePane state but not implemented in this excerpt */}
      </div>
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
