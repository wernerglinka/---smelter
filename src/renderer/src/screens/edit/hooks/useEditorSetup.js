import { useEffect } from 'react';
import { setupEditor } from '../components/EditSpace/editor';

/**
 * Hook to set up the editor when component mounts
 * Returns a cleanup function for when component unmounts
 * 
 * @returns {void}
 */
export const useEditorSetup = () => {
  useEffect(() => {
    // Set up the editor
    const cleanupEditor = setupEditor();
    
    // Return cleanup function
    return () => {
      cleanupEditor();
    };
  }, []);
};