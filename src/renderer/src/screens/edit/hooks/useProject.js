import { useState, useEffect } from 'react';
import { StorageOperations } from '../../lib/storage-operations';

export const useProject = () => {
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');

  useEffect(() => {
    const loadProject = () => {
      const projectData = StorageOperations.getProjectData();
      if (projectData) {
        setProjectPath(projectData.projectPath);
        setProjectName(StorageOperations.getProjectName(projectData.projectPath));
      }
    };

    loadProject();
  }, []);

  return {
    projectName,
    projectPath
  };
};