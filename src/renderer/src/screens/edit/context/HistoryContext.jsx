import React, { createContext, useContext, useState, useCallback } from 'react';
import { logger } from '@utils/services/logger';

/**
 * Context for managing form state history (undo/redo)
 */
const HistoryContext = createContext(null);

/**
 * HistoryProvider component that provides history functionality
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components
 */
export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [historyPosition, setHistoryPosition] = useState(-1);
  const [redoLevel, setRedoLevel] = useState(0);
  const MAX_HISTORY = 10;
  
  /**
   * Adds the current form state to history
   * 
   * @param {Array|Object} formState Current form state
   */
  const addToHistory = useCallback((formState) => {
    if (!formState) return;
    
    const formStateStr = typeof formState === 'string' 
      ? formState 
      : JSON.stringify(formState);
    
    // Check if this state is already the most recent one in history
    if (historyPosition >= 0 && history[historyPosition] === formStateStr) {
      return; // Skip if it's the same state
    }
    
    setHistory(prevHistory => {
      // Truncate history if we're not at the end
      const truncatedHistory = prevHistory.slice(0, historyPosition + 1);
      
      // Add new state and trim if needed
      const newHistory = [...truncatedHistory, formStateStr].slice(-MAX_HISTORY);
      
      // Update history position to point to the new entry
      setHistoryPosition(newHistory.length - 1);
      
      // Reset redo level since we've added a new state
      setRedoLevel(0);
      
      return newHistory;
    });
  }, [history, historyPosition]);
  
  /**
   * Adds a history entry, replacing the current position
   * Used when making direct changes to the form
   * 
   * @param {Array|Object} formState Current form state
   */
  const addHistoryEntry = useCallback((formState) => {
    if (!formState) return;
    
    const formStateStr = typeof formState === 'string' 
      ? formState 
      : JSON.stringify(formState);
    
    // Check if this state is already the last one in history
    if (historyPosition >= 0 && history[historyPosition] === formStateStr) {
      return; // Skip if it's the same state
    }
    
    setHistory(prevHistory => {
      // Create a new array with the updated state at the current position
      const newHistory = [...prevHistory];
      
      // If we have no history yet, add initial entry
      if (historyPosition < 0) {
        newHistory.push(formStateStr);
        setHistoryPosition(0);
      } else {
        // Truncate history after current position
        const truncatedHistory = newHistory.slice(0, historyPosition + 1);
        
        // Replace the last entry with the new state
        truncatedHistory[historyPosition] = formStateStr;
        
        // Keep history within max size
        const finalHistory = truncatedHistory.slice(-MAX_HISTORY);
        
        // Update position to point to the end
        setHistoryPosition(finalHistory.length - 1);
        
        return finalHistory;
      }
      
      return newHistory;
    });
    
    // Reset redo level
    setRedoLevel(0);
  }, [history, historyPosition]);
  
  /**
   * Resets form to a saved state
   * 
   * @param {string|Object} state State to restore
   * @param {Function} resetForm Function to reset the form
   */
  const resetFormToState = useCallback((state, resetForm) => {
    if (!state || !resetForm) return;
    
    // Parse the state if it's a string
    try {
      resetForm(state);
    } catch (error) {
      logger.error('Error resetting form to state:', error);
    }
  }, []);
  
  /**
   * Handles undo operation
   * 
   * @param {Function} resetForm Function to reset form to a specific state
   */
  const undo = useCallback((resetForm) => {
    if (historyPosition <= 0 || !history.length) {
      return; // Can't undo beyond the start of history
    }
    
    // Move back one step in history
    const newPosition = historyPosition - 1;
    setHistoryPosition(newPosition);
    setRedoLevel(prevLevel => prevLevel + 1);
    
    // Reset form to the previous state
    resetFormToState(history[newPosition], resetForm);
  }, [history, historyPosition, resetFormToState]);
  
  /**
   * Handles redo operation
   * 
   * @param {Function} resetForm Function to reset form to a specific state
   */
  const redo = useCallback((resetForm) => {
    if (historyPosition >= history.length - 1 || !history.length) {
      return; // Can't redo beyond the end of history
    }
    
    // Move forward one step in history
    const newPosition = historyPosition + 1;
    setHistoryPosition(newPosition);
    setRedoLevel(prevLevel => Math.max(0, prevLevel - 1));
    
    // Reset form to the next state
    resetFormToState(history[newPosition], resetForm);
  }, [history, historyPosition, resetFormToState]);
  
  /**
   * Resets the history when loading a new file
   * 
   * @param {Array|Object} initialFields Initial form fields to start with
   */
  const resetHistory = useCallback((initialFields) => {
    if (initialFields) {
      // Initialize history with the first state
      const initialState = JSON.stringify(initialFields);
      setHistory([initialState]);
      setHistoryPosition(0);
    } else {
      setHistory([]);
      setHistoryPosition(-1);
    }
    setRedoLevel(0);
  }, []);
  
  const value = {
    history,
    historyPosition,
    redoLevel,
    canUndo: historyPosition > 0,
    canRedo: historyPosition < history.length - 1,
    addToHistory,
    addHistoryEntry,
    undo,
    redo,
    resetHistory
  };
  
  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

/**
 * Hook to access history context
 * @returns {Object} History context value
 */
export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};