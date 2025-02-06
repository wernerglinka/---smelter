// screens/home/ui/setup.js
import { StorageOperations } from '../../lib/storage-operations.js';
import { navigate } from '../navigation/utils.js';

/**
 * DOM selector constants
 */
const SELECTORS = {
  recentProject: '.js-recent-project',
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  editProject: '.js-edit-project',
  cloneProject: '.js-clone-from-github'
};

/**
 * Error messages//
 */
const ERRORS = {
  NO_RECENT: 'No recent project found',
  NO_ELEMENT: 'Element not found'
};

/**
 * Handles click on recent project link
 * @param {Event} e - Click event
 */
const handleRecentProject = (e) => {
  e.preventDefault();
  navigate(e.target.href);
};

/**
 * Sets up recent project UI and handlers
 * @throws {Error} If required elements not found
 */
export const setupRecentProject = () => {
  return new Promise((resolve) => {
    window.electronAPI.onReady(async () => {
      try {
        // check if a recent project is found in local storage
        const recentProject = StorageOperations.getProjectPath();
        if (!recentProject) {
          resolve();
          return;
        }
        // check if the project still exists
        const projectExists = await window.electronAPI.directories.exists(recentProject);
        if (!projectExists.data) {
          StorageOperations.clearProjectData();
          resolve();
          return;
        }

        // check if the element for the project name exists
        const element = document.querySelector(SELECTORS.recentProject);
        if (!element) {
          console.warn(ERRORS.NO_ELEMENT);
          resolve();
          return;
        }

        // set up the project name and event listener
        const projectName = StorageOperations.getProjectName(recentProject);
        element.innerHTML = projectName;
        element.setAttribute('title', `Open ${projectName}`);
        element.addEventListener('click', handleRecentProject);

        resolve();
      } catch (error) {
        console.error('Failed to setup recent project:', error);
        resolve();
      }
    });
  });
};

/**
 * Initializes event listeners for project handlers
 * @param {Object.<string, Function>} handlers - Map of selectors to handlers
 */
export const initializeEventListeners = (handlers) => {
  Object.entries(handlers).forEach(([selector, handler]) => {
    const element = document.querySelector(selector);
    if (element) {
      element.addEventListener('click', handler);
    } else {
      console.warn(`${ERRORS.NO_ELEMENT}: ${selector}`);
    }
  });
};
