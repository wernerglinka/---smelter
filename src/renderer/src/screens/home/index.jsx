import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderPlusIcon,
  FolderOpenIcon,
  FolderMinusIcon,
  GithubIcon,
  DeleteIcon
} from '../../components/icons';
import { HomeProvider, useHome } from './context/HomeContext';

import './styles.css';

/**
 * RecentProjectsList component - displays list of recent projects
 * @returns {JSX.Element} The rendered component
 */
const RecentProjectsList = () => {
  const {
    recentProjects,
    openingRecentProject,
    removingRecentProject,
    openRecentProject,
    removeRecentProject
  } = useHome();

  if (recentProjects.length === 0) {
    return null;
  }

  return (
    <>
      <li className="listHeader recent">Recent</li>
      {recentProjects.map((project, index) => (
        <li key={index} className="recent-project">
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              openRecentProject(project);
            }}
          >
            {project.name}
          </Link>
          <span 
            className="delete-wrapper" 
            onClick={() => removeRecentProject(project)}
          >
            <DeleteIcon className="delete-icon" />
          </span>
        </li>
      ))}
    </>
  );
};

/**
 * ActionsList component - displays list of available actions
 * @returns {JSX.Element} The rendered component
 */
const ActionsList = () => {
  const {
    initializingProject,
    deletingProject,
    editingProject,
    cloningGithub,
    initializeProject,
    deleteProject,
    editProject,
    cloneGithub
  } = useHome();

  return (
    <>
      <li className="listHeader">Start</li>
      <li>
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            initializeProject();
          }}
          className={initializingProject ? 'preview' : ''}
        >
          <FolderPlusIcon className="icon" />
          Initialize a Project from existing folder
        </Link>
      </li>
      <li>
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            cloneGithub();
          }}
          className={cloningGithub ? 'preview' : ''}
        >
          <GithubIcon className="icon" />
          Clone a Project from Github
        </Link>
      </li>
      <li>
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            editProject();
          }}
          className={editingProject ? 'preview' : ''}
        >
          <FolderOpenIcon className="icon" />
          Edit a Project
        </Link>
      </li>
      <li>
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            deleteProject();
          }}
          className={deletingProject ? 'preview' : ''}
        >
          <FolderMinusIcon className="icon" />
          Delete a Project
        </Link>
      </li>
    </>
  );
};

/**
 * HomeContent component - main content area for the home screen
 * @returns {JSX.Element} The rendered component
 */
const HomeContent = () => {
  const { loadingProjects } = useHome();

  return (
    <main className="welcome">
      <h1>Smelter</h1>
      <p>Content Management for Metalsmith refined</p>

      <ul className="projects">
        <ActionsList />
        {!loadingProjects && <RecentProjectsList />}
      </ul>
    </main>
  );
};

/**
 * Home component - main landing page for the Metallurgy application
 * Wraps content with context provider
 * @returns {JSX.Element} The rendered component
 */
const Home = () => {
  return (
    <HomeProvider>
      <HomeContent />
    </HomeProvider>
  );
};

export default Home;