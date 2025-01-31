// git-handlers.js

import simpleGit from 'simple-git';
import { readdirSync } from 'node:fs';

/**
 * Executes a series of Git operations: check status, add changes, commit, and push
 *
 * @param {SimpleGit} git - Initialized SimpleGit instance for the repository
 * @param {string} message - Commit message
 * @returns {Promise<object>} Operation result
 * @returns {object} result.commitResult - Result from git.commit()
 * @returns {object} result.status - Repository status before commit
 * @throws {Error} If no changes to commit
 * @throws {Error} If git operations fail
 * @example
 * const git = simpleGit('/path/to/repo');
 * const result = await executeGitOperations(git, 'feat: add new feature');
 */
const executeGitOperations = async (git, message) => {
  // Check status first
  const status = await git.status();
  if (!status.modified.length && !status.not_added.length) {
    throw new Error('No changes to commit');
  }

  // Add all changes
  await git.add('.');
  const commitResult = await git.commit(message);
  await git.push();
  return { commitResult, status };
};

/**
 * Handles committing changes to a repository
 *
 * @param {Event} event - IPC event
 * @param {object} params - Commit parameters
 * @param params.projectPath
 * @param params.message
 * @param dialogOps
 * @returns {Promise<object>} Operation result
 */
const handleGitCommit = async (event, { projectPath, message }, dialogOps) => {
  try {
    const git = simpleGit(projectPath);

    // Show progress dialog
    await dialogOps.showCustomMessage({
      type: 'info',
      message: 'Committing changes...\nPlease wait.',
      buttons: []
    });

    try {
      const { commitResult, status } = await executeGitOperations(git, message);

      dialogOps.closeProgress();

      return {
        status: 'success',
        data: {
          commitHash: commitResult.commit,
          summary: status.modified
        }
      };
    } catch (error) {
      dialogOps.closeProgress();

      const errorMessage =
        error.message === 'Commit operation timed out'
          ? 'The commit operation took too long. Please try again.'
          : `Error during commit: ${error.message}`;

      await dialogOps.showCustomMessage({
        type: 'error',
        message: errorMessage,
        buttons: ['OK']
      });

      return {
        status: 'failure',
        error: error.message
      };
    }
  } catch (error) {
    dialogOps.closeProgress();
    return {
      status: 'failure',
      error: error.message
    };
  }
};

/**
 * Clones a Git repository to a local path
 *
 * @param {Event} event - IPC event object
 * @param {object} params - Clone parameters
 * @param {string} params.repoUrl - Repository URL
 * @returns {object} Operation result
 * @returns {string} result.status - 'success' or 'failure'
 * @returns {string} [result.error] - Error message if failed
 * @example
 * await handleGitClone(event, {
 *   repoUrl: 'https://github.com/user/repo.git'
 * })
 */

// Utility function to wait for dialog closure
/**
 *
 */
const waitForDialog = () => new Promise((resolve) => setTimeout(resolve, 500));

/**
 *
 * @param event
 * @param root0
 * @param root0.repoUrl
 * @param dialogOps
 */
const handleGitClone = async (event, { repoUrl }, dialogOps) => {
  try {
    if (!repoUrl) {
      // Show custom input dialog for URL
      const urlResult = await dialogOps.showCustomMessage({
        type: 'custom',
        message: 'Enter Git Repository URL:',
        input: true,
        buttons: ['Clone', 'Cancel']
      });

      // Make sure we got a valid result
      if (!urlResult?.response?.value || urlResult.response.index !== 0) {
        return { status: 'cancelled' };
      }

      repoUrl = urlResult.response.value;

      // Wait for window to close before proceeding
      await waitForDialog();
    }

    // Show dialog to select directory to clone into
    const dialogResult = await dialogOps.showDialog('showOpenDialog', {
      title: 'Select the folder to clone into',
      message: 'Select the folder to clone into',
      properties: ['openDirectory', 'createDirectory']
    });
    const localPath = dialogResult.data.filePaths?.[0];

    if (!localPath) {
      throw new Error('No directory selected');
    }

    // check if the directory is empty
    const dirContents = readdirSync(localPath);
    if (dirContents.length > 0) {
      // Show custom dialog for non-empty directory
      const emptyResult = await dialogOps.showCustomMessage({
        type: 'warning',
        message: 'Selected directory is not empty. Would you like to select a different directory?',
        buttons: ['Yes', 'No']
      });

      // Wait for dialog to close
      await waitForDialog();

      // Check if user wants to try another directory
      if (emptyResult?.response?.index === 0) {
        const recursiveResult = await handleGitClone(event, { repoUrl }, dialogOps);
        return recursiveResult;
      }
      return { status: 'failure', error: 'Operation cancelled - Directory not empty' };
    }

    // Clone repository to selected directory
    await simpleGit().clone(repoUrl, localPath);

    // Show custom success dialog and ask to proceed
    const successResult = await dialogOps.showCustomMessage({
      type: 'success',
      message: `Repository successfully cloned to:\n${localPath}\n\nWould you like to work with this project?`,
      buttons: ['Yes', 'No']
    });

    // Wait for success dialog to close
    await waitForDialog();

    return {
      status: 'success',
      proceed: {
        status: 'success',
        data: successResult?.response?.index === 0
      },
      path: localPath
    };
  } catch (error) {
    console.error('Clone Repository Error:', error);
    return { status: 'failure', error: error.message };
  }
};

/**
 *
 * @param event
 * @param root0
 * @param root0.projectPath
 */
const handleGitStatus = async (event, { projectPath }) => {
  try {
    const git = simpleGit(projectPath);
    const status = await git.status();
    return {
      status: 'success',
      data: {
        modified: status.modified,
        not_added: status.not_added
      }
    };
  } catch (error) {
    return {
      status: 'failure',
      error: error.message
    };
  }
};

/**
 * Creates and returns IPC handlers for git operations
 *
 * @param window
 * @param dialogOps
 * @returns {object} Object containing handler functions
 */
const createGitHandlers = (window, dialogOps) => ({
  /**
   *
   * @param event
   * @param params
   */
  handleGitCommit: (event, params) => handleGitCommit(event, params, dialogOps),
  /**
   *
   * @param event
   * @param params
   */
  handleGitClone: (event, params) => handleGitClone(event, params, dialogOps),
  handleGitStatus
});

export { createGitHandlers };
