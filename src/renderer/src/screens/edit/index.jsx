import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarHideIcon, SidebarShowIcon } from '../../components/icons';
import Sidebar from './components/Sidebar';
import { useProject } from '../../hooks/useProject';
import EditSpace from './components/EditSpace';
import PreviewPane from './components/PreviewPane';
import { FileLoaderService } from '../../services/file-loader';

import './styles.css';

export default function EditPage() {
  const { projectName, projectPath } = useProject();
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  const toggleSidebarView = () => {
    setSidebarVisible((prev) => !prev);
  };

  const handleFileSelect = async (filepath) => {
    try {
      setSelectedFile(filepath);
      const content = await FileLoaderService.loadFile(filepath);
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <main className="edit-container">
      <div className="titlebar" />

      <h1 className="page-title">
        {projectName}
        <Link className="btn" to="/">
          Start Over
        </Link>
      </h1>

      <div className="sidebar-toggle" onClick={toggleSidebarView} role="button" tabIndex={0}>
        {isSidebarVisible ? <SidebarHideIcon /> : <SidebarShowIcon />}
      </div>

      <div className="edit-pane">
        <Sidebar
          path={projectPath}
          className={!isSidebarVisible ? 'hidden' : ''}
          onFileSelect={handleFileSelect}
        />
        <EditSpace
          $expanded={!isSidebarVisible}
          fileContent={fileContent}
        />
        <PreviewPane />
      </div>
    </main>
  );
}
