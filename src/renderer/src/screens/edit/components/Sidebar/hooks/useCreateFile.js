import { useCallback } from 'react';
import { handleNewFileClick } from '../click-handlers';

export const useCreateFile = (handleFileSelect, setFileSelected) => {
  return useCallback((extension, folder) => {
    return handleNewFileClick(extension, folder, handleFileSelect, setFileSelected);
  }, [handleFileSelect, setFileSelected]);
};