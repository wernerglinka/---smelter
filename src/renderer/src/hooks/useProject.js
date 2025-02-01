import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { ProjectService } from '../services/project';
import { isValidProjectStructure } from '../utils/validation';

export const useProject = () => {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        const projectData = StorageService.getProjectData();
        
        if (!projectData?.projectPath) {
          setIsLoading(false);
          return;
        }

        const isValid = await isValidProjectStructure(projectData.projectPath);
        
        if (!isValid) {
          StorageService.clearProjectData();
          setIsLoading(false);
          return;
        }

        const config = await ProjectService.loadProjectConfig(projectData.projectPath);
        
        setProject({
          name: StorageService.getProjectName(projectData.projectPath),
          path: projectData.projectPath,
          ...config
        });
      } catch (error) {
        console.error('Failed to load project:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, []);

  const clearProject = () => {
    StorageService.clearProjectData();
    setProject(null);
  };

  return {
    project,
    isLoading,
    error,
    clearProject
  };
};