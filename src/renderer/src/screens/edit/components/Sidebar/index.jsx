import React, { useState } from 'react';
import './styles.css';
import { RenderContentFilesTree } from './ContentFilesTree';
import { RenderDataFilesTree } from './DataFilesTree';

/**
 * Sidebar component for file navigation and editing options
 * @param {Object} props - Component props
 * @param {string} props.path - Project root path
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onFileSelect - Callback function when a file is selected
 */
const Sidebar = ({ path, className = '', onFileSelect }) => {
  // Tracks which pane is currently active ('select-file', 'add-field', or 'add-template')
  const [activePane, setActivePane] = useState('select-file');

  // Tracks the currently selected file path
  // Used to enable/disable buttons and highlight selected file in tree
  const [fileSelected, setFileSelected] = useState(null);

  /**
   * Handles switching between different sidebar panes
   * @param {string} pane - Pane identifier to switch to
   */
  const handleTabClick = (pane) => {
    setActivePane(pane);
  };

  /**
   * Handles the "Add New File" button click
   * TODO: Implement new file creation functionality
   */
  const handleNewFileClick = () => {
    console.log('New file button clicked');
  };

  /**
   * Handles file selection from either content or data file trees
   * Updates local state and notifies parent component so it can  respond to
   * the file selection
   * @param {string} filepath - Path of the selected file
   */
  const handleFileSelect = async (filepath) => {
    setFileSelected(filepath);
    if (onFileSelect) {
      onFileSelect(filepath);
    }
  };

  return (
    <div className={`sidebar ${className}`}>
      {/* Sidebar Header with Tab Navigation */}
      <div className="sidebar-container container-background">
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
            <div className="js-dom-tree-wrapper container-background">
              <h3>Project Files</h3>

              {/* New File Creation Button */}
              <button className="btn" onClick={handleNewFileClick}>Add New File</button>

              {/* Content Files Tree - Shows markdown files */}
              <RenderContentFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
              />

              {/* Data Files Tree - Shows JSON/YAML data files */}
              <RenderDataFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
              />
            </div>
          </div>
        )}
        {/* Note: Add Field and Add Template panes are conditionally rendered
            based on activePane state but not implemented in this excerpt */}
      </div>
    </div>
  );
};

export default Sidebar;
