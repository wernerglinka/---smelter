import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@utils/services/logger';

/**
 * Context for managing form snapshots
 */
const SnapshotContext = createContext(null);

/**
 * SnapshotProvider component that provides snapshot functionality
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 */
export const SnapshotProvider = ({ children }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [showSnapshotList, setShowSnapshotList] = useState(false);
  
  /**
   * Creates a snapshot of the current form state
   * 
   * @param {Array|Object} formFields Current form fields
   */
  const createSnapshot = useCallback((formFields) => {
    if (!formFields) {
      logger.warn('Cannot create snapshot: No form fields provided');
      return;
    }
    
    const timestamp = Date.now();
    const formattedDate = new Date(timestamp).toLocaleString();
    
    // Create a name based on the current time
    const name = `Snapshot ${formattedDate}`;
    
    // Create a deep copy of form fields to ensure snapshot integrity
    const fieldsCopy = JSON.parse(JSON.stringify(formFields));
    
    setSnapshots(prevSnapshots => [
      ...prevSnapshots,
      {
        name,
        timestamp,
        formState: fieldsCopy
      }
    ]);
    
    // Show a message to indicate successful snapshot creation
    const messageElement = document.createElement('div');
    messageElement.className = 'snapshot-message';
    messageElement.textContent = `Snapshot created: ${name}`;
    document.body.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
    
    logger.info(`Snapshot created: ${name}`);
  }, []);
  
  /**
   * Restores a previously created snapshot
   * 
   * @param {number} index Index of the snapshot to restore
   * @param {Function} resetForm Function to reset the form
   * @param {Function} resetHistory Function to reset history
   */
  const restoreSnapshot = useCallback((index, resetForm, resetHistory) => {
    if (!snapshots[index]) {
      logger.warn(`Cannot restore snapshot: Invalid index ${index}`);
      return;
    }
    
    try {
      const snapshot = snapshots[index];
      
      // Reset form to the snapshot state
      if (resetForm) {
        resetForm(snapshot.formState);
      }
      
      // Reset history to start with this snapshot state
      if (resetHistory) {
        resetHistory(snapshot.formState);
      }
      
      logger.info(`Snapshot restored: ${snapshot.name}`);
    } catch (error) {
      logger.error('Error restoring snapshot:', error);
    }
  }, [snapshots]);
  
  /**
   * Resets all snapshots
   */
  const resetSnapshots = useCallback(() => {
    setSnapshots([]);
  }, []);
  
  const value = {
    snapshots,
    showSnapshotList,
    setShowSnapshotList,
    createSnapshot,
    restoreSnapshot,
    resetSnapshots
  };
  
  return <SnapshotContext.Provider value={value}>{children}</SnapshotContext.Provider>;
};

/**
 * Hook to access snapshot context
 * @returns {Object} Snapshot context value
 */
export const useSnapshots = () => {
  const context = useContext(SnapshotContext);
  if (!context) {
    throw new Error('useSnapshots must be used within a SnapshotProvider');
  }
  return context;
};