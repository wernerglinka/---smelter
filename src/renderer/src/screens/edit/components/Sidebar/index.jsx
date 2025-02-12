import React, { useState, useCallback, memo } from 'react';
import './styles.css';
import { RenderContentFilesTree } from './ContentFilesTree';
import { RenderDataFilesTree } from './DataFilesTree';
import { FolderPlusIcon, FilePlusIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';

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
   * Handles the "Add New File" click
   * Opens a dialog for the file name and creates the file
   * @param {string} extension - File extension (.md or .json)
   */
  const handleNewFileClick = async (extension) => {
    console.log('=== Starting handleNewFileClick ===');
    console.log('Extension:', extension);
    console.log('Active folder:', activeFolder);

    if (!activeFolder) return;

    try {
      // Get project path from storage
      const projectPath = StorageOperations.getProjectPath();
      if (!projectPath) {
        throw new Error('Project path not found in storage');
      }
      console.log('Project path:', projectPath);

      // Show dialog to get file name
      console.log('Showing dialog...');
      const { response } = await window.electronAPI.dialog.showCustomMessage({
        type: 'custom',
        message: 'Enter file name:',
        buttons: ['Create', 'Cancel'],
        input: true
      });
      console.log('Dialog response:', response);

      // User cancelled or clicked Cancel
      if (!response || response.index === 1 || !response.value) {
        console.log('Dialog cancelled or empty value');
        return;
      }

      // Get the file name from dialog and add extension if needed
      let fileName = response.value;
      if (!fileName.endsWith(`.${extension}`)) {
        fileName = `${fileName}.${extension}`;
      }
      console.log('Generated filename:', fileName);

      // Create full file path using project path
      const filePath = `${projectPath}/${activeFolder}/${fileName}`;
      console.log('Full file path:', filePath);

      // Check if file already exists
      console.log('Checking if file exists...');
      const existsResponse = await window.electronAPI.files.exists(filePath);
      console.log('Exists response:', {
        raw: existsResponse,
        type: typeof existsResponse,
        stringified: JSON.stringify(existsResponse)
      });

      if (existsResponse && existsResponse.status === 'success') {
        console.log('File exists check - status success, data:', existsResponse.data);
      } else {
        console.log('File exists check - raw value:', existsResponse);
      }

      // If the file exists, show error and return
      if (existsResponse && existsResponse.data === true) {
        console.log('File already exists, showing error dialog');
        await window.electronAPI.dialog.showCustomMessage({
          type: 'error',
          message: 'A file with this name already exists.',
          buttons: ['OK']
        });
        return;
      }

      // Create empty file with appropriate initial content
      console.log('Creating new file...');
      const initialContent = extension === 'json' ? '{}' : '';
      const writeResult = await window.electronAPI.files.write({
        obj: initialContent,
        path: filePath
      });
      console.log('Write result:', writeResult);

      if (writeResult.status === 'success') {
        console.log('File created successfully, dispatching event');
        window.dispatchEvent(new CustomEvent('fileCreated', {
          detail: { path: filePath }
        }));

        // Select the newly created file
        handleFileSelect(filePath);
        setFileSelected(filePath);
      } else {
        console.log('File creation failed:', writeResult.error);
        throw new Error(`Failed to create file: ${writeResult.error}`);
      }
    } catch (error) {
      console.error('Error in handleNewFileClick:', error);
      console.error('Error stack:', error.stack);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to create file: ${error.message}`,
        buttons: ['OK']
      });
    }
    console.log('=== Ending handleNewFileClick ===');
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
                  onClick={activeFolder ? () => handleNewFileClick(activeFileExtension) : undefined}
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
