// services/project.js
export const ProjectOperations = {
  validateProject: async (projectFolder) => {
    try {
      // Check if .metallurgy directory exists
      const metallurgyPath = `${projectFolder}/.metallurgy`;
      const { status: dirStatus } = await window.electronAPI.directories.exists(metallurgyPath);
      if (dirStatus !== 'success') {
        console.log('Metallurgy directory not found');
        return false;
      }

      // Check if projectData.json exists
      const configPath = `${projectFolder}/.metallurgy/projectData.json`;
      const { status: fileStatus } = await window.electronAPI.files.exists(configPath);
      if (fileStatus !== 'success') {
        console.log('projectData.json not found');
        return false;
      }

      // Try to read and parse the config file to ensure it's valid
      const { status: readStatus, data } = await window.electronAPI.files.read(configPath);
      if (readStatus !== 'success' || !data) {
        console.log('Failed to read projectData.json');
        return false;
      }

      try {
        JSON.parse(data);
        return true;
      } catch {
        console.log('Invalid JSON in projectData.json');
        return false;
      }
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  },

  loadProjectConfig: async (projectFolder) => {
    const configFilePath = `${projectFolder}/.metallurgy/projectData.json`;
    const { status, data, error } = await window.electronAPI.files.read(configFilePath);

    if (status === 'failure') {
      throw new Error(error || 'Failed to read project configuration');
    }

    return JSON.parse(data);
  },

  deleteProject: async (projectFolder) => {
    const metallurgyPath = `${projectFolder}/.metallurgy`;
    // Verify .metallurgy folder exists before deletion
    const folderExists = await window.electronAPI.directories.exists(metallurgyPath);
    if (!folderExists) {
      throw new Error('Project configuration folder .metallurgy not found');
    }

    const result = await window.electronAPI.directories.delete(metallurgyPath);
    if (result.status === 'failure') {
      throw new Error(`Failed to delete .metallurgy folder: ${result.error}`);
    }
    return true;
  },

  confirmDeletion: async (projectName) => {
    const result = await window.electronAPI.dialog.showCustomMessage({
      type: 'warning',
      message: `Are you sure you want to remove the ${projectName} project?`,
      buttons: ['Yes', 'No']
    });
    return result?.response?.index === 0;
  }
};
