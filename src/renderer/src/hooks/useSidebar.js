import { useState } from 'react';

export const useSidebar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activePane, setActivePane] = useState('js-select-file');

  const toggleSidebar = () => {
    setIsVisible(!isVisible);
  };

  const switchPane = (paneId) => {
    setActivePane(paneId);
  };

  return {
    isVisible,
    activePane,
    toggleSidebar,
    switchPane
  };
};