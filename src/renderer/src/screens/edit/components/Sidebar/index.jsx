import React, { useState } from 'react';
import './styles.css';
import { RenderContentFilesTree } from './ContentFilesTree';
import { RenderDataFilesTree } from './DataFilesTree';

const Sidebar = ({ path, className = '', onFileSelect }) => {
  const [activePane, setActivePane] = useState('select-file');
  const [fileSelected, setFileSelected] = useState(null);

  const handleTabClick = (pane) => {
    setActivePane(pane);
  };

  const handleNewFileClick = () => {
    console.log('New file button clicked');
  };

  const handleFileSelect = async (filepath) => {
    setFileSelected(filepath);
    if (onFileSelect) {
      onFileSelect(filepath);
    }
  };

  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-container container-background">
        <ul className="sidebar-pane-selection">
          <li>
            <button
              className={`btn ${activePane === 'select-file' ? 'active' : ''}`}
              onClick={() => handleTabClick('select-file')}
            >
              Select Files
            </button>
          </li>
          <li className="select-file">
            <button
              className={`btn ${activePane === 'add-field' ? 'active' : ''}`}
              onClick={() => handleTabClick('add-field')}
              disabled={!fileSelected}
            >
              Add Field
            </button>
          </li>
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

      <div className="sidebar-panes">
        {activePane === 'select-file' && (
          <div className="sidebar-pane active">
            <div className="sidebar-hint container-background">
              <p>Select a file to start editing...</p>
            </div>
            <div className="js-dom-tree-wrapper container-background">

              <h3>Project Files</h3>

              <button className="btn" onClick={ handleNewFileClick }>Add New File</button>

              <RenderContentFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
              />

              <RenderDataFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
