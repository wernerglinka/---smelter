import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * @typedef {Object} SidebarContextValue
 * @property {boolean} isVisible - Whether sidebar is visible
 * @property {string} activePane - ID of the active pane
 * @property {Function} toggleSidebar - Toggle sidebar visibility
 * @property {Function} switchPane - Switch to a specific pane
 * @property {Function} showSidebar - Show the sidebar
 * @property {Function} hideSidebar - Hide the sidebar
 */

export const SidebarContext = createContext(null);

/**
 * Provider for sidebar state
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} [props.initialVisibility=true] - Initial sidebar visibility
 * @param {string} [props.initialPane='js-select-file'] - Initial active pane ID
 */
export const SidebarProvider = ({ 
  children, 
  initialVisibility = true, 
  initialPane = 'js-select-file' 
}) => {
  const [isVisible, setIsVisible] = useState(initialVisibility);
  const [activePane, setActivePane] = useState(initialPane);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  /**
   * Show the sidebar
   */
  const showSidebar = useCallback(() => {
    setIsVisible(true);
  }, []);

  /**
   * Hide the sidebar
   */
  const hideSidebar = useCallback(() => {
    setIsVisible(false);
  }, []);

  /**
   * Switch to a specific pane
   * @param {string} paneId - ID of the pane to switch to
   */
  const switchPane = useCallback((paneId) => {
    if (paneId) {
      setActivePane(paneId);
      
      // Ensure sidebar is visible when switching panes
      if (!isVisible) {
        setIsVisible(true);
      }
    }
  }, [isVisible]);

  const value = {
    isVisible,
    activePane,
    toggleSidebar,
    switchPane,
    showSidebar,
    hideSidebar
  };

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

/**
 * Hook to access sidebar context
 * @returns {SidebarContextValue}
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}