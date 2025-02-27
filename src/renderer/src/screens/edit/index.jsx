import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarHideIcon, SidebarShowIcon } from '@components/icons';
import Sidebar from './components/Sidebar';
import { useProject } from '@hooks/useProject';
import EditSpace from './components/EditSpace';
import PreviewPane from './components/PreviewPane';
import { FileLoaderService } from '@services/file-loader';
import { DragStateProvider } from '@lib/drag-drop/DragStateContext';
import { GhostElement } from '@lib/drag-drop/GhostElement';

import './styles.css';

/**
 * EditPage Component - Main editing interface for the application
 *
 * This component serves as the primary editing workspace where users can:
 * - View and navigate project files through a sidebar
 * - Edit selected files in the main editing space
 * - Preview changes in real-time
 *
 * The layout consists of three main sections:
 * 1. Sidebar: File navigation and project structure
 * 2. EditSpace: Main editing area for file content
 * 3. PreviewPane: YAML preview of the edited content
 */
export default function EditPage() {
  // Get project information from context
  const { projectName, projectPath } = useProject();

  // State management for UI and file handling
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);

  /**
   * Toggles the visibility of the sidebar. Sidebar can be retracted
   * to provide more space for the editing space.
   */
  const toggleSidebarView = () => {
    setSidebarVisible((prev) => !prev);
  };

  /**
   * Handles file selection from the sidebar
   * Loads the selected file's content and updates the edit space
   * @param {string} filepath - Path to the selected file
   */
  const handleFileSelect = async (filepath) => {
    try {
      setSelectedFile(filepath);

      // If filepath is null, clear the content
      if (!filepath) {
        setFileContent(null);
        return;
      }

      const content = await FileLoaderService.loadFile(filepath);
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file:', error);
      // TODO: Add error handling UI
    }
  };

  return (
    <DragStateProvider>
      <main className="edit-container">
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
            filePath={selectedFile}
          />
          <PreviewPane />
        </div>
        <GhostElement />
      </main>
    </DragStateProvider>
  );
}
