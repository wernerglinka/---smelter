import React, { useState } from 'react';
import styles from './styles.module.css';
import classNames from 'classnames';

const Sidebar = ({ className }) => {
  const [activePane, setActivePane] = useState('select-file');

  const handleTabClick = (pane) => {
    setActivePane(pane);
  };

  return (
    <div className={className}>
      <ul>
        <li>
          <button
            className={classNames(styles.button, {
              [styles.active]: activePane === 'select-file'
            })}
            onClick={() => handleTabClick('select-file')}
          >
            Select File
          </button>
        </li>
        <li>
          <button
            className={classNames(styles.button, {
              [styles.active]: activePane === 'add-field'
            })}
            onClick={() => handleTabClick('add-field')}
          >
            Add Field
          </button>
        </li>
        <li>
          <button
            className={classNames(styles.button, {
              [styles.active]: activePane === 'add-template'
            })}
            onClick={() => handleTabClick('add-template')}
          >
            Add Template
          </button>
        </li>
      </ul>


      <div className="sidebar-panes">
        {activePane === 'select-file' && (
          <div id="js-select-file" className="active">
            <div className="sidebar-hint container-background">
              <p>Select a project file to start editing...</p>
            </div>
            <div className="js-dom-tree-wrapper container-background">

              <button onClick={() => handleTabClick('new-page')}>
                Add New Page
              </button>

              <h3>Project Files</h3>
              <div className="js-files-list" />
            </div>
          </div>
        )}

        {activePane === 'add-field' && (
          <div id="js-add-field">
            <div className="sidebar-hint container-background">
              <p>Drag a field into the editor...</p>
            </div>
            <div className="container-background">
              <h3>Empty Fields</h3>
              {/* Field components will be added here */}
            </div>
          </div>
        )}

        {activePane === 'add-template' && (
          <div id="js-add-template">
            <div className="sidebar-hint container-background">
              <p>Drag a template into the editor...</p>
            </div>
            <div className="js-templates-wrapper container-background">
              <h3>Page Templates</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
