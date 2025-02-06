// lib/form-submission/error-handlers.js
/**
 * Handles file operation errors
 * @param {Error} error - Original error
 * @param {string} filePath - Original file path
 * @param {string} backupPath - Backup file path
 */
export const handleFileError = async (error, filePath, backupPath) => {
  if (await window.electronAPI.files.exists(backupPath)) {
    await window.electronAPI.files.writeYAML({
      obj: await window.electronAPI.files.readYAML(backupPath),
      path: filePath
    });
  }
  throw new Error(`Failed to save file: ${error.message}`);
};

/**
 * Cleans up temporary files after submission
 * @param {Array<string>} paths - Paths to cleanup
 */
export const cleanupTempFiles = async (paths) => {
  for (const path of paths) {
    if (await window.electronAPI.files.exists(path)) {
      await window.electronAPI.files.remove(path);
    }
  }
};
