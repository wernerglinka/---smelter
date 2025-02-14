import React, { useState, useCallback, memo } from 'react';
import './styles.css';
import { RenderContentFilesTree } from './ContentFilesTree';
import { RenderDataFilesTree } from './DataFilesTree';
import { FolderPlusIcon, FilePlusIcon, HelpIcon } from '@components/icons';
import { StorageOperations } from '@services/storage';
import { handleNewFileClick } from './click-handlers';
import { useCreateFile } from './hooks/useCreateFile';
import { useCreateFolder } from './hooks/useCreateFolder';
import { HelpText } from '@components/HelpText';
import { projectFilesHelpText } from './help/project-files.js';
import { baseFields } from '@src/baseFields';

/// Memoize the Sidebar component to prevent unnecessary re-renders
const Sidebar = memo(({ path, className = '', onFileSelect, onFileDelete }) => {
  const [activePane, setActivePane] = useState('select-file');
  const [fileSelected, setFileSelected] = useState(null);
  const [openFolders, setOpenFolders] = useState(() => new Set());
  const [activeFolder, setActiveFolder] = useState(null); // Change from '' to null
  const [activeFileExtension, setActiveFileExtension] = useState('.md'); // Default to .md

  const handleFileSelect = useCallback((filepath) => {
    setFileSelected(filepath);
    onFileSelect(filepath);
  }, [ onFileSelect ] );

  const createFile = useCreateFile(handleFileSelect, setFileSelected);
  const createFolder = useCreateFolder();

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



  /**
   * Handles switching between different sidebar panes
   * @param {string} pane - Pane identifier to switch to
   */
  const handleTabClick = (pane) => {
    setActivePane(pane);
  };

  // Add handler to receive active folder updates from FileTreeBase
  const handleFolderActivate = (folderPath) => {
    const extension = folderPath ? (folderPath.startsWith('data') ? '.json' : '.md') : null;
    setActiveFolder(folderPath);
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
            <div className="sidebar-hint container-background">
              <p>Select a file to start editing...</p>
            </div>
            {/* File Tree Container */}
            <div className="container-background">
              <h3 className="has-help-text">Project Files <HelpText text={projectFilesHelpText} /></h3>

              {/* New File/Folder Creation Button */}
              <ul className="add-new">
                <li
                  className={!activeFolder ? 'disabled' : ''}
                  onClick={() => createFolder(activeFolder)}
                >
                  <FolderPlusIcon />
                </li>
                <li
                  className={!activeFolder ? 'disabled' : ''}
                  onClick={() => createFile(activeFileExtension, activeFolder)}
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
                activeFolder={activeFolder}
              />

              {/* Data Files Tree */}
              <RenderDataFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
                openFolders={openFolders}
                onFolderToggle={handleFolderToggle}
                onFolderActivate={handleFolderActivate}
                activeFolder={activeFolder}
              />
            </div>
          </div>
        ) }

        {/* AddField pane */ }
        {activePane === 'add-field' && (
          <div className="sidebar-pane active">
            <div class="sidebar-hint container-background">
              <p>Drag a field into the editor...</p>
            </div>

            <div class="container-background">
              <h3>Empty Fields</h3>

              { baseFields.map( field => (
                <div
                  key={field.name}
                  className="component-selection draggable"
                  draggable="true"
                  data-component={field.name}
                >
                  {field.name}
                </div>
              )) }

            </div>
          </div>
        )}

        {/* AddTemplate pane */ }
        {activePane === 'add-template' && (
          <div className="sidebar-pane active">
            <div class="sidebar-hint container-background">
              <p>Drag a template into the editor...</p>
            </div>
            <div class="container-background">
              <h3>Templates</h3>
              <p>Templates are not yet implemented.</p>
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
