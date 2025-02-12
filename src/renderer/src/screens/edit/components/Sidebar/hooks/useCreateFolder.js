import { useCallback } from 'react';
import { handleNewFolderClick } from '../click-handlers';

export const useCreateFolder = () => {
  return useCallback((folder) => {
    return handleNewFolderClick(folder);
  }, []);
};