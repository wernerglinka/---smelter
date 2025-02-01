import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderPlusIcon, FolderOpenIcon } from '../../components/icons';
import { StorageOperations } from '../lib/storage-operations';
import { selectProject } from '../lib/select-project';

/**
 * Home component - main landing page for the Metallurgy application
 * @returns {JSX.Element} The rendered component
 */
function Home() {
  const [recentProjects, setRecentProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecentProjects = async () => {
      try {
        const projectData = StorageOperations.getProjectData();
        if (projectData) {
          setRecentProjects([{
            path: projectData.projectPath,
            name: StorageOperations.getProjectName(projectData.projectPath)
          }]);
        } else {
          setRecentProjects([]);
        }
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
      // Use existing selectProject function
      const projectFolder = await selectProject();

      if (projectFolder === "abort") return;

      // Use existing storage operations
      StorageOperations.saveProjectPath(projectFolder);
      StorageOperations.clearProjectData();

      navigate('/edit');
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
            <FolderOpenIcon className="icon" />
            Edit Project
          </Link>
        </li>

        {/* Recent Projects Section */}
        {recentProjects.length > 0 && (
          <>
            <li className="listHeader">Recent Projects</li>
            {recentProjects.map((project, index) => (
              <li key={index}>
                <Link to={`/edit/${encodeURIComponent(project.path)}`} className="recent-project">
                  {project.name || project.path}
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
