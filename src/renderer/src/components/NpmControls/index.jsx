import React, { useState, useEffect } from 'react';
import { useProject } from '../../hooks/useProject';

const NpmControls = () => {
  console.log('NpmControls component rendering');
  const { projectPath } = useProject();
  const [isRunning, setIsRunning] = useState(false);

  console.log('Current state:', { projectPath, isRunning });

  const hasNodeModules = async (path) => {
    try {
      console.log('Checking for node_modules in:', path);
      const result = await window.electronAPI.directories.exists(`${path}/node_modules`);
      console.log('hasNodeModules result:', result);
      return result.status === 'success' && result.data === true;
    } catch (error) {
      console.error('Error checking node_modules:', error);
      return false;
    }
  };

  const updateNpmState = async () => {
    if (!projectPath) {
      console.log('updateNpmState: No project path, returning');
      return;
    }

    console.log('updateNpmState: Checking state for project:', projectPath);
    const hasModules = await hasNodeModules(projectPath);

    const state = {
      running: isRunning,
      hasNodeModules: hasModules,
      hasProject: !!projectPath
    };

    console.log('Sending npm-state-change with state:', state);
    window.electronAPI.ipcRenderer.send('npm-state-change', state);
  };

  // Effect for initial state check and menu update
  useEffect(() => {
    console.log('projectPath effect triggered:', projectPath);
    if (projectPath) {
      updateNpmState();
    }
  }, [projectPath]);

  // Effect for setting up menu triggers
  useEffect(() => {
    console.log('Setting up menu triggers effect. projectPath:', projectPath);
    if (!projectPath) return;

    const setupListeners = () => {
      console.log('Setting up menu listeners');
      // Remove existing listeners
      window.electronAPI.ipcRenderer.removeListener('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.removeListener('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.removeListener('npm-stop-trigger', handleStop);

      // Add menu triggers
      window.electronAPI.ipcRenderer.on('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.on('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.on('npm-stop-trigger', handleStop);

      console.log('Menu listeners setup complete');
    };

    setupListeners();

    // Cleanup listeners on unmount
    return () => {
      console.log('Cleaning up menu listeners');
      window.electronAPI.ipcRenderer.removeListener('npm-install-trigger', handleInstall);
      window.electronAPI.ipcRenderer.removeListener('npm-start-trigger', handleStart);
      window.electronAPI.ipcRenderer.removeListener('npm-stop-trigger', handleStop);
    };
  }, [projectPath]);

  const handleInstall = async () => {
    console.log('handleInstall triggered');
    if (!projectPath) return;

    try {
      const result = await window.electronAPI.npm.install(projectPath);
      console.log('Install result:', result);
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
    console.log('handleStart triggered');
    if (!projectPath) return;

    try {
      const result = await window.electronAPI.npm.start(projectPath);
      console.log('Start result:', result);
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
    console.log('handleStop triggered');
    try {
      const result = await window.electronAPI.npm.stop();
      console.log('Stop result:', result);
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
