/**
 * Git operation handlers for the application
 * @module git-handlers
 */

import simpleGit from 'simple-git';
import { readdirSync } from 'node:fs';

/**
 * @typedef {Object} DirectoryResult
 * @property {string} status - Operation status ('success' or 'cancelled')
 * @property {string} [path] - Selected directory path (optional)
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the URL is valid
 * @property {string} [error] - Error message if validation failed (optional)
 */

/**
 * @typedef {Object} GitOperationResult
 * @property {string} status - Operation status ('success' or 'failure')
 * @property {Object} [data] - Operation data (optional)
 * @property {string} [error] - Error message (optional)
 */

/**
 * Creates and returns handlers for Git operations
 * @param {BrowserWindow} window - The main electron window instance
 * @param {Object} dialogOps - Dialog operations object
 * @returns {Object} Object containing Git operation handlers
 */
export const createGitHandlers = (window, dialogOps) => {
  /**
   * Prompts user to select a directory
   * @returns {Promise<DirectoryResult>} Directory selection result
   */
  const selectDirectory = async () => {
    // implementation...
  };

  /**
   * Validates Git repository URL
   * @param {string} url - URL to validate
   * @returns {ValidationResult} Validation result
   */
  const validateGitUrl = (url) => {
    // implementation...
  };

  return {
    handleGitCommit: (event, params) => handleGitCommit(event, params, dialogOps),
    handleGitClone: (event, params) => handleGitClone(event, params, dialogOps),
    handleGitStatus,
    selectDirectory,
    validateGitUrl
  };
};

/**
 * Executes a series of Git operations: check status, add changes, commit, and push
 *
 * @param {SimpleGit} git - Initialized SimpleGit instance for the repository
 * @param {string} message - Commit message
 * @returns {Promise<GitOperationResult>} Operation result
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
 * @returns {Promise<GitOperationResult>} Operation result
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
 * Handles directory selection for git clone
 * @param {object} dialogOps - Dialog operations object
 * @returns {Promise<DirectoryResult>} Selected directory path or cancelled status
 */
const handleDirectorySelection = async (dialogOps) => {
  const dialogResult = await dialogOps.showDialog('showOpenDialog', {
    title: 'Select the folder to clone into',
    message: 'Select the folder to clone into',
    properties: ['openDirectory', 'createDirectory']
  });

  if (!dialogResult?.data?.filePaths?.[0]) {
    return { status: 'cancelled' };
  }

  const localPath = dialogResult.data.filePaths[0];

  // Check if directory is empty
  const dirContents = readdirSync(localPath);
  if (dirContents.length > 0) {
    const emptyResult = await dialogOps.showCustomMessage({
      type: 'warning',
      message: 'Selected directory is not empty. Would you like to select a different directory?',
      buttons: ['Yes', 'No']
    });

    await waitForDialog();

    if (emptyResult?.response?.index === 0) {
      return { status: 'retry' };
    }

    return { status: 'cancelled' };
  }

  return { status: 'success', path: localPath };
};

/**
 *
 * @param event
 * @param root0
 * @param root0.repoUrl
 * @param dialogOps
 */
const handleGitClone = async (event, { repoUrl }, dialogOps) => {
  try {
    // Get repository URL if not provided
    if (!repoUrl) {
      const urlResult = await dialogOps.showCustomMessage({
        type: 'custom',
        message: 'Enter Git Repository URL:',
        input: true,
        buttons: ['Clone', 'Cancel']
      });

      if (!urlResult?.response || urlResult.response.index !== 0) {
        return { status: 'cancelled' };
      }

      repoUrl = urlResult.response.value;
    }

    // Validate URL before proceeding
    const urlValidation = validateGitUrl(repoUrl);
    if (!urlValidation.isValid) {
      await dialogOps.showCustomMessage({
        type: 'error',
        message: urlValidation.error,
        buttons: ['OK']
      });
      // Recursively retry the clone operation
      return handleGitClone(event, { repoUrl: null }, dialogOps);
    }

    await waitForDialog();

    let directoryResult;
    do {
      directoryResult = await handleDirectorySelection(dialogOps);
      if (directoryResult.status === 'cancelled') {
        return { status: 'cancelled' };
      }
    } while (directoryResult.status === 'retry');

    const localPath = directoryResult.path;

    // Create a timeout promise
    const timeout = new Promise((_, reject) => {
      setTimeout(
        () => {
          reject(new Error('Clone operation timed out after 5 minutes'));
        },
        5 * 60 * 1000
      ); // 5 minutes timeout
    });

    // Create the clone promise
    const cloneOperation = simpleGit().clone(repoUrl, localPath);

    // Race between timeout and clone operation
    await Promise.race([cloneOperation, timeout]);

    const successResult = await dialogOps.showCustomMessage({
      type: 'success',
      message: `Repository successfully cloned to:\n${localPath}\n\nWould you like to work with this project?`,
      buttons: ['Yes', 'No']
    });

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

    const errorMessage = error.message.includes('timed out')
      ? 'The clone operation timed out after 5 minutes. Please check your internet connection and try again.'
      : `Failed to clone repository: ${error.message}`;

    await dialogOps.showCustomMessage({
      type: 'error',
      message: errorMessage,
      buttons: ['OK']
    });
    return { status: 'error', error: error.message };
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

// Remove the duplicate createGitHandlers declaration at the bottom of the file
// The main implementation with proper exports is at the top

/**
 * Validates Git repository URL
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 * @returns {boolean} result.isValid - Whether the URL is valid
 * @returns {string} [result.error] - Error message if validation failed
 */
const validateGitUrl = (url) => {
  if (!url) {
    return { isValid: false, error: 'Repository URL is required' };
  }

  // Strict patterns for different Git URL formats
  const patterns = {
    https:
      /^https:\/\/(?:www\.)?([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}\/[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+(?:\.git)?$/,
    ssh: /^git@([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}:[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+\.git$/,
    git: /^git:\/\/([a-zA-Z0-9][a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}\/[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+\.git$/
  };

  // Check if URL matches any of the allowed patterns
  const matchesPattern = Object.entries(patterns).some(([type, pattern]) => pattern.test(url));

  if (!matchesPattern) {
    return {
      isValid: false,
      error:
        'Invalid Git URL format. Must be a valid HTTPS, SSH, or Git protocol URL.\nExample: https://github.com/username/repository.git'
    };
  }

  return { isValid: true };
};
