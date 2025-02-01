// Migrated from project-operations.js
export const ProjectService = {
  validateProject: async (projectFolder) => {
    const metallurgyPath = `${projectFolder}/.metallurgy`;
    return await window.electronAPI.directories.exists(metallurgyPath);
  },

  loadProjectConfig: async (projectFolder) => {
    const configFilePath = `${projectFolder}/.metallurgy/projectData.json`;
    const result = await window.electronAPI.files.read(configFilePath);
    if (result.status === 'failure') {
      throw new Error(`Failed to read project config: ${result.error}`);
    }
    return result.data;
  },

  deleteProject: async (projectFolder) => {
    const metallurgyPath = `${projectFolder}/.metallurgy`;
    const folderExists = await window.electronAPI.directories.exists(metallurgyPath);
    
    if (!folderExists) {
      throw new Error('Project configuration folder .metallurgy not found');
    }
    // Add deletion logic here
  }
};