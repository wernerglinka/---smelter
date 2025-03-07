/**
 * Handles file deletion with user confirmation
 * When a file is deleted, the FileTreeBase component:
 *  - Handles the deletion via handleFileDelete
 *  - Dispatches the 'fileDeleted' event
 *  - The UI updates to remove just the deleted file
 * The folder structure and state (open) is preserved because:
 *  - The openFolders state in FileTreeBase is independent of the file list
 *  - The deletion event only triggers a re-render of the file tree
 *  - The folder open/closed state isn't affected by the file deletion
 *
 * @param {string} filepath - Path of file to delete
 * @param {string} fileSelected - Currently selected file path
 * @param {Function} onFileClick - Callback when a file is clicked
 */
export const handleFileDelete = async (filepath, fileSelected, onFileClick) => {
  try {
    const { response } = await window.electronAPI.dialog.showCustomMessage({
      type: 'question',
      message: `Are you sure you want to delete ${filepath}?`,
      buttons: ['Yes', 'No']
    });

    if (!response || response.index === 1) return;

    const result = await window.electronAPI.files.delete(filepath);

    if (result.status === 'success') {
      if (fileSelected === filepath) {
        onFileClick(null);
      }
      window.dispatchEvent(
        new CustomEvent('fileDeleted', {
          detail: { path: filepath }
        })
      );
    } else {
      throw new Error(`Failed to delete file: ${result.error}`);
    }
  } catch (error) {
    await window.electronAPI.dialog.showCustomMessage({
      type: 'error',
      message: `Failed to delete file: ${error.message}`,
      buttons: ['OK']
    });
  }
};
