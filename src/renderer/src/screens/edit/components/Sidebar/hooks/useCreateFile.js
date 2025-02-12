import { useCallback } from 'react';
import { handleNewFileClick } from '../click-handlers';

/**
 * Custom hook that provides a memoized function for creating new files
 *
 * @param {Function} handleFileSelect - Callback to select the newly created file
 * @param {Function} setFileSelected - State setter for the selected file
 * @returns {Function} Memoized function that takes extension and folder parameters
 *
 * Usage:
 * ```jsx
 * const createFile = useCreateFile(handleFileSelect, setFileSelected);
 * // Later...
 * createFile('md', 'content/blog');
 * ```
 */
export const useCreateFile = (handleFileSelect, setFileSelected) => {
  return useCallback(
    (extension, folder) => {
      return handleNewFileClick(extension, folder, handleFileSelect, setFileSelected);
    },
    [handleFileSelect, setFileSelected]
  );
};
