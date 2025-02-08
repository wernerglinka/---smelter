import React, { useState, useEffect } from 'react';
import { useProject } from '../../hooks/useProject';

const NpmControls = () => {
  const { projectPath } = useProject();
  const [isRunning, setIsRunning] = useState(false);

  const hasNodeModules = async (path) => {
    try {
      const result = await window.electronAPI.directories.exists(`${path}/node_modules`);
      return result.status === 'success' && result.data === true;
    } catch (error) {
      console.error('Error checking node_modules:', error);
      return false;
    }
  };

  const updateNpmState = async () => {
    if (!projectPath) {
      return;
    }

    const hasModules = await hasNodeModules(projectPath);

    const state = {
      running: isRunning,
      hasNodeModules: hasModules,
      hasProject: !!projectPath
    };

    window.electronAPI.ipcRenderer.send('npm-state-change', state);
  };

  // Effect for initial state check and menu update
  useEffect(() => {
    if (projectPath) {
      updateNpmState();
    }
  }, [projectPath]);

  // Effect for setting up menu triggers
  useEffect(() => {
    if (!projectPath) return;

    const setupListeners = () => {
      // Remove existing listeners
      window.electronAPI.ipcRenderer.removeListener('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.removeListener('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.removeListener('npm-stop-trigger', handleStop);

      // Add menu triggers
      window.electronAPI.ipcRenderer.on('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.on('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.on('npm-stop-trigger', handleStop);
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      window.electronAPI.ipcRenderer.removeListener('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.removeListener('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.removeListener('npm-stop-trigger', handleStop);
    };
  }, [projectPath]);

  const handleInstall = async () => {
    if (!projectPath) return;

    try {
      const result = await window.electronAPI.npm.install(projectPath);
      if (result.status === 'success') {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: 'Dependencies installed successfully',
          buttons: ['OK']
        });
        await updateNpmState();
      } else {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: result.error,
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('Install error:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'custom',
        message: error.message,
        buttons: ['OK']
      });
    }
  };

  const handleStart = async () => {
    if (!projectPath) return;

    try {
      const result = await window.electronAPI.npm.start(projectPath);
      if (result.status === 'success') {
        setIsRunning(true);
        await updateNpmState();
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: 'Project started successfully',
          buttons: ['OK']
        });
      } else {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: result.error,
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('Start error:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'custom',
        message: error.message,
        buttons: ['OK']
      });
    }
  };

  const handleStop = async () => {

    try {
      const result = await window.electronAPI.npm.stop();
      if (result.status === 'success') {
        setIsRunning(false);
        await updateNpmState();
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: 'Project stopped successfully',
          buttons: ['OK']
        });
      } else {
        await window.electronAPI.dialog.showCustomMessage({
          type: 'custom',
          message: result.error,
          buttons: ['OK']
        });
      }
    } catch (error) {
      console.error('Stop error:', error);
      await window.electronAPI.dialog.showCustomMessage({
        type: 'custom',
        message: error.message,
        buttons: ['OK']
      });
    }
  };

  return null;
};

export default NpmControls;
