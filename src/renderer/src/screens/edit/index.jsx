import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarHideIcon, SidebarShowIcon } from '../../components/icons';
import Sidebar from './components/Sidebar';
import { useProject } from '../../hooks/useProject';
import EditSpace from './components/EditSpace';
import PreviewPane from './components/PreviewPane';

import './styles.css';

export default function EditPage() {
  const { projectName, projectPath } = useProject();
  const [isSidebarVisible, setSidebarVisible] = useState(true);

  const toggleSidebarView = () => {
    setSidebarVisible((prev) => !prev);
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

      <div className="sidebar-toggle"onClick={toggleSidebarView} role="button" tabIndex={0}>
        {isSidebarVisible ? <SidebarHideIcon /> : <SidebarShowIcon />}
      </div>

      <div className="edit-pane">
        {isSidebarVisible && <Sidebar path={projectPath} />}
        <EditSpace $expanded={!isSidebarVisible} />
        <PreviewPane />
      </div>
    </main>
  );
}
