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

/**
 * @typedef {Object} SidebarProps
 * @property {string} path - Root path of the project
 * @property {string} [className=''] - Additional CSS classes to apply
 * @property {(filepath: string) => void} onFileSelect - Callback when a file is selected
 * @property {(filepath: string) => void} onFileDelete - Callback when a file is deleted
 */

/**
 * Sidebar component provides file navigation and content management functionality.
 * It contains three main panes:
 * 1. File Selection: Shows project structure and allows file/folder operations
 * 2. Add Field: Provides draggable field components for form building
 * 3. Add Template: Allows adding pre-configured templates (not implemented)
 *
 * @param {SidebarProps} props - Component properties
 * @returns {JSX.Element} Rendered sidebar component
 */
const Sidebar = memo(({ path, className = '', onFileSelect, onFileDelete }) => {
  // Track active pane and file selection state
  const [activePane, setActivePane] = useState('select-file');
  const [fileSelected, setFileSelected] = useState(null);
  const [openFolders, setOpenFolders] = useState(() => new Set());

  // Track active folder for new file/folder creation
  const [activeFolder, setActiveFolder] = useState(null);
  // Default to markdown files unless in data folder
  const [activeFileExtension, setActiveFileExtension] = useState('.md');

  /**
   * Handles file selection and propagates the selection to parent components
   * @param {string} filepath - Path of the selected file
   */
  const handleFileSelect = useCallback((filepath) => {
    setFileSelected(filepath);
    onFileSelect(filepath);
  }, [onFileSelect]);

  // Initialize file and folder creation hooks
  const createFile = useCreateFile(handleFileSelect, setFileSelected);
  const createFolder = useCreateFolder();

  /**
   * Toggles folder open/closed state in the file tree
   * @param {string} folderPath - Path of the folder to toggle
   */
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
   * Switches between different sidebar panes (file selection, add field, add template)
   * @param {string} pane - Identifier of the pane to activate
   */
  const handleTabClick = (pane) => {
    setActivePane(pane);
  };

  /**
   * Updates active folder and file extension based on folder selection
   * Sets appropriate file extension (.json for data folders, .md for content)
   * @param {string} folderPath - Path of the activated folder
   */
  const handleFolderActivate = (folderPath) => {
    const extension = folderPath ? (folderPath.startsWith('data') ? '.json' : '.md') : null;
    setActiveFolder(folderPath);
    setActiveFileExtension(extension);
  };

  const handleDragStart = (e, field) => {
    // Add a visual drag effect
    e.currentTarget.classList.add('dragging');

    // Set the drag data
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = (e) => {
    // Remove the visual drag effect
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div className={`sidebar ${className}`}>
      {/* Navigation Tabs */}
      <div className="container-background">
        <ul className="sidebar-pane-selection">
          {/* File Selection Tab - Always enabled */}
          <li>
            <button
              className={`btn ${activePane === 'select-file' ? 'active' : ''}`}
              onClick={() => handleTabClick('select-file')}
            >
              Select Files
            </button>
          </li>
          {/* Add Field Tab - Enabled only when a file is selected */}
          <li className="select-file">
            <button
              className={`btn ${activePane === 'add-field' ? 'active' : ''}`}
              onClick={() => handleTabClick('add-field')}
              disabled={!fileSelected}
            >
              Add Field
            </button>
          </li>
          {/* Add Template Tab - Enabled only when a file is selected */}
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

      {/* Pane Content Area */}
      <div className="sidebar-panes">
        {/* File Selection Pane */}
        {activePane === 'select-file' && (
          <div className="sidebar-pane active">
            <div className="sidebar-hint container-background">
              <p>Select a file to start editing...</p>
            </div>
            <div className="container-background">
              <h3 className="has-help-text">
                Project Files <HelpText text={projectFilesHelpText} />
              </h3>

              {/* File/Folder Creation Controls */}
              <ul className={ `add-new ${ !activeFolder ? 'hidden' : '' }` }>
                <li>Add...</li>
                <li
                  onClick={() => createFolder(activeFolder)}
                >
                  <FolderPlusIcon />
                </li>
                <li
                  onClick={() => createFile(activeFileExtension, activeFolder)}
                >
                  <FilePlusIcon />
                </li>
              </ul>

              {/* File Trees */}
              <RenderContentFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
                openFolders={openFolders}
                onFolderToggle={handleFolderToggle}
                onFolderActivate={handleFolderActivate}
                activeFolder={activeFolder}
              />
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
        )}

        {/* Add Field Pane - Shows draggable field components */}
        {activePane === 'add-field' && (
          <div className="sidebar-pane active">
            <div className="sidebar-hint container-background">
              <p>Drag a field into the editor...</p>
            </div>
            <div className="container-background">
              <h3>Empty Fields</h3>

              <ul className="base-fields-list">
                {baseFields.map(field => (
                  <li
                    key={field.name}
                    className="component-selection"
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, field)}
                    onDragEnd={handleDragEnd}
                  >
                    {field.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Add Template Pane - Template functionality placeholder */}
        {activePane === 'add-template' && (
          <div className="sidebar-pane active">
            <div className="sidebar-hint container-background">
              <p>Drag a template into the editor...</p>
            </div>
            <div className="container-background">
              <h3>Templates</h3>
              <p>Templates are not yet implemented.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Set display name for debugging purposes
Sidebar.displayName = 'Sidebar';

export default Sidebar;
