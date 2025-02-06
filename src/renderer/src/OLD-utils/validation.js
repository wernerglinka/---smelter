// New utility functions for validation
export const isValidProjectPath = (path) => {
  if (!path) return false;
  // Add more path validation logic as needed
  return true;
};

export const isValidProjectStructure = async (path) => {
  try {
    const hasMetallurgy = await window.electronAPI.directories.exists(`${path}/.metallurgy`);
    const hasConfig = await window.electronAPI.files.exists(`${path}/.metallurgy/projectData.json`);
    return hasMetallurgy && hasConfig;
  } catch (error) {
    console.error('Project structure validation failed:', error);
    return false;
  }
};
