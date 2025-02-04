// screens/home/renderer.js
import { handleNewProject } from './handlers/new-project.js';
import { handleDeleteProject } from './handlers/delete-project.js';
import { handleEditProject } from './handlers/edit-project.js';
import { handleCloneGithub } from './handlers/clone-github.js';
import { navigate } from './navigation/utils.js';
import { setupRecentProject, initializeEventListeners } from './ui/setup.js';

const SELECTORS = {
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  editProject: '.js-edit-project',
  cloneProject: '.js-clone-from-github'
};

const initialize = async () => {
  console.log('Initializing home renderer...');

  const handlers = {
    [SELECTORS.newProject]: handleNewProject,
    [SELECTORS.deleteProject]: handleDeleteProject,
    [SELECTORS.editProject]: handleEditProject,
    [SELECTORS.cloneProject]: handleCloneGithub
  };

  // Add menu trigger listener
  console.log('Setting up git-clone-trigger listener...');

  // First, ensure we're properly removing any existing listener
  const existingListener = () => handleCloneGithub(null, navigate);
  window.electronAPI.ipcRenderer.removeListener('git-clone-trigger', existingListener);

  // Then add our new listener
  window.electronAPI.ipcRenderer.on('git-clone-trigger', () => {
    console.log('git-clone-trigger received!');
    handleCloneGithub(null, navigate);
  });

  initializeEventListeners(handlers);
  await setupRecentProject();
};

export default initialize;
