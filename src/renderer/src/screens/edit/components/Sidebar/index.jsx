import React, { useState, useEffect } from 'react';
import './styles.css';
import { StorageOperations } from '../../../../services/storage';
import { FolderIcon, FileMdIcon, FileJsonIcon } from '../../../../components/icons';

const Sidebar = ({ path }) => {
  const [ activePane, setActivePane ] = useState( 'select-file' );
  const [ fileSelected, setFileSelected ] = useState( null );

  const RenderContentFilesTree = ({ path, fileSelected, onFileSelect }) => {
    const [fileTree, setFileTree] = useState(null);
    const [ error, setError ] = useState( null );
    const [ openFolders, setOpenFolders ] = useState(new Set(['src'])); // Start with root folder open

    const handleFileClick = (filepath) => {
      onFileSelect(filepath);
      console.log('File selected:', filepath);
    };

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

          // Process the files into a tree structure
          const processFiles = (data) => {
            const tree = { src: {} };
            const files = Object.values(data)[0];

            files.forEach((fileObj) => {
              // Handle folders
              if (Array.isArray(fileObj)) {
                return;
              }

              // Handle folder objects
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

              // Handle root-level files
              const [filename, filepath] = Object.entries(fileObj)[0];
              if (filename.endsWith('.md')) {
                tree.src[filename] = filepath;
              }
            });

            console.log('New processed tree:', tree);
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

    if (!fileTree) {
      return <div>Loading...</div>;
    }

    const renderTreeNode = (node, path = '') => {
      return Object.entries(node).map(([key, value]) => {
        const currentPath = path ? `${path}/${key}` : key;
        const isDirectory = typeof value === 'object' && !Array.isArray(value);

        if (isDirectory) {
          const hasFiles = Object.keys(value).length > 0;
          if (!hasFiles) return null;

          const isOpen = openFolders.has(currentPath);

          return (
            <li key={key} className={`folder ${isOpen ? 'open' : ''}`}>
              <span
                className="folder-name"
                onClick={() => handleFolderClick(currentPath)}
              >
                <FolderIcon/>
                {key}
              </span>
              <ul className="folder-content" style={{ display: isOpen ? 'block' : 'none' }}>
                {renderTreeNode(value, currentPath)}
              </ul>
            </li>
          );
        }

        // Only show markdown files
        if (!key.endsWith('.md')) {
          return null;
        }

        return (
          <li key={key} className="file md">
            <a
              onClick={(e) => {
                e.preventDefault();
                handleFileClick(value);
              }}
              className={fileSelected === value ? 'selected' : ''}
            >
              <FileMdIcon/>
              {key}
            </a>
          </li>
        );
      }).filter(Boolean); // Remove null entries
    };

    return (
      <div className="file-tree">
        <ul className="dom-tree js-dom-tree js-files-list">
          {renderTreeNode(fileTree)}
        </ul>
      </div>
    );
  };


  const handleTabClick = (pane) => {
    setActivePane(pane);
  };
  const handleNewFileClick = () => {
    console.log('New file button clicked');
    // Handle new file creation here
  };

  const handleFileSelect = (filepath) => {
    setFileSelected(filepath);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-container container-background">
        <ul className="sidebar-pane-selection">
          <li className="select-file">
            <button
              className={ `btn ${activePane === 'select-file' ? 'active' : ''}` }
              onClick={ () => handleTabClick('select-file') }
            >
              Select File
            </button>
          </li>

          <li className="select-file">
            <button
              className={ `btn ${activePane === 'add-field' ? 'active' : ''}` }
              onClick={ () => handleTabClick( 'add-field' ) }
              disabled={ !fileSelected }
            >
              Add Field
            </button>
          </li>

          <li className="select-file">
            <button
              className={ `btn ${activePane === 'add-template' ? 'active' : ''}` }
              onClick={ () => handleTabClick( 'add-template' ) }
              disabled={ !fileSelected }
            >
              Add Template
            </button>
          </li>
        </ul>
      </div>

      <div className="sidebar-panes">

        { activePane === 'add-field' && (
          <div className="sidebar-pane">
            <div className="sidebar-hint container-background">
              <p>Drag a field into the editor...</p>
            </div>
            <div className="container-background">
              <h3>Empty Fields</h3>
              {/* Field components will be added here */}
            </div>
          </div>
        ) }

        { activePane === 'add-template' && (
          <div className="sidebar-pane">
            <div className="sidebar-hint container-background">
              <p>Drag a template into the editor...</p>
            </div>
            <div className="js-templates-wrapper container-background">
              <h3>Page Templates</h3>
            </div>
          </div>
        ) }

        { activePane === 'select-file' && (
          <div className="sidebar-pane active">
            <div className="sidebar-hint container-background">
              <p>Select a project file to start editing...</p>
            </div>
            <div className="js-dom-tree-wrapper container-background">
              <button className="btn" onClick={ handleNewFileClick }>Add New File</button>

              <h3>Project Files</h3>

              <RenderContentFilesTree
                path={path}
                fileSelected={fileSelected}
                onFileSelect={handleFileSelect}
              />

            </div>
          </div>
        ) }
      </div>
    </div>
  );
};

export default Sidebar;
