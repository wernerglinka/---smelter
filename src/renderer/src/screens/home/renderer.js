// screens/home/index.js
import { handleNewProject } from './handlers/new-project.js';
import { handleDeleteProject } from './handlers/delete-project.js';
import { handleEditProject } from './handlers/edit-project.js';
import { handleCloneGithub } from './handlers/clone-github.js';
import { setupRecentProject, initializeEventListeners } from './ui/setup.js';

const SELECTORS = {
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  editProject: '.js-edit-project',
  cloneProject: '.js-clone-from-github'
};

const initialize = async () => {

  const handlers = {
    [ SELECTORS.newProject ]: handleNewProject,
    [ SELECTORS.deleteProject ]: handleDeleteProject,
    [ SELECTORS.editProject ]: handleEditProject,
    [ SELECTORS.cloneProject ]: handleCloneGithub
  };

  // Add menu trigger listener
  window.electronAPI.ipcRenderer.removeListener( 'git-clone-trigger', handleCloneGithub );
  window.electronAPI.ipcRenderer.on( 'git-clone-trigger', () => {
    handleCloneGithub();
  } );

  initializeEventListeners( handlers );
  await setupRecentProject();
};

await initialize();