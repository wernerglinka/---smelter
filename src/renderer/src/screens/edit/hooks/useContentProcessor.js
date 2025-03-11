import { useEffect } from 'react';
import { useEdit } from '../context/EditContext';
import { useHistory } from '../context/HistoryContext';
import { useSnapshots } from '../context/SnapshotContext';

/**
 * Hook to process content when fileContent changes
 * This handles initializing the form with the file content
 * and resetting history and snapshots as needed
 * 
 * @param {Object} fileContent The content of the file being edited
 */
export const useContentProcessor = (fileContent) => {
  const { processFileContent } = useEdit();
  const { resetHistory } = useHistory();
  const { resetSnapshots } = useSnapshots();
  
  useEffect(() => {
    // Handler to reset history with fields when they're loaded
    const handleResetHistory = (fields) => {
      resetHistory(fields);
      resetSnapshots();
    };
    
    // Process content when fileContent changes
    if (fileContent) {
      processFileContent(fileContent, handleResetHistory);
    } else {
      // Clear history and snapshots if no file content
      resetHistory();
      resetSnapshots();
    }
  }, [fileContent, processFileContent, resetHistory, resetSnapshots]);
};