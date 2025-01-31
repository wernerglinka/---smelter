import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderPlusIcon, FolderOpenIcon } from '../../components/icons';

/**
 * Home component - main landing page for the Metallurgy application
 * @returns {JSX.Element} The rendered component
 */
function Home() {
  const [recentProjects, setRecentProjects] = useState([]);

  useEffect(() => {
    // TODO: Implement recent projects loading
    // This will replace the setupRecentProject function from setup.js
    const loadRecentProjects = async () => {
      try {
        // Will need to implement this in the preload/main process
        const projects = await window.electronAPI.getRecentProjects();
        setRecentProjects(projects);
      } catch (error) {
        console.error('Failed to load recent projects:', error);
      }
    };

    loadRecentProjects();
  }, []);

  /**
   * Handles initializing a new project
   * @param {React.MouseEvent} e - Click event
   */
  const handleNewProject = async (e) => {
    e.preventDefault();
    try {
      const projectFolder = await window.electronAPI.selectDirectory();
      if (!projectFolder) return;

      // TODO: Implement project initialization
      await window.electronAPI.saveProjectPath(projectFolder);
      // Navigate to edit page
      // TODO: Implement React Router navigation
    } catch (error) {
      console.error('Error creating new project:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'error',
        message: `Failed to create project: ${error.message}`,
        buttons: ['OK']
      });
    }
  };

  return (
    <div className="welcome">
      <div className="titlebar" />
      <h1>Smelter</h1>
      <p>Content Management for Metalsmith refined</p>

      <ul className="projects">
        <li className="listHeader">Start</li>
        <li>
          <a href="#" onClick={handleNewProject} className="project-action">
            <FolderPlusIcon className="icon" />
            Initialize a Project from existing folder
          </a>
        </li>
        <li>
          <Link to="/edit" className="project-action">
            <svg viewBox="0 0 24 21" xmlns="http://www.w3.org/2000/svg">
              <FolderOpenIcon className="icon" />
            </svg>
            Edit Project
          </Link>
        </li>

        {/* Recent Projects Section */}
        {recentProjects.length > 0 && (
          <>
            <li className="listHeader">Recent Projects</li>
            {recentProjects.map((project, index) => (
              <li key={index}>
                <Link to={`/edit/${project.id}`} className="recent-project">
                  {project.name}
                </Link>
              </li>
            ))}
          </>
        )}
      </ul>
    </div>
  );
}

export default Home;
