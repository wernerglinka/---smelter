import { StorageOperations } from '@services/storage';

export const getTemplates = async () => {
  try {
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) {
      throw new Error('Project path not found in storage');
    }

    // Get template types from project directory
    const typesPath = `${projectPath}/.metallurgy/frontMatterTemplates/templates/types.json`;
    const {
      status: typesStatus,
      data: typesConfig,
      error: typesError
    } = await window.electronAPI.files.read(typesPath);

    if (typesStatus === 'failure') {
      throw new Error(`Failed to read template types: ${typesError}`);
    }

    // Extract types array and formatting rules from config
    const templateTypes = Array.isArray(typesConfig) ? typesConfig : typesConfig.types;
    const formattingRules = !Array.isArray(typesConfig) ? typesConfig.formatting || {} : {};

    // Initialize groupedTemplates using types from JSON
    const groupedTemplates = templateTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {});

    // Read templates directory
    const templatesPath = `${projectPath}/.metallurgy/frontMatterTemplates/templates`;
    const {
      status: templatesStatus,
      data: templatesData,
      error: templatesError
    } = await window.electronAPI.directories.read(templatesPath);

    if (templatesStatus === 'failure') {
      throw new Error(`Failed to read templates directory: ${templatesError}`);
    }

    // Process the directory structure
    const directoryContents = templatesData[templatesPath];
    if (!Array.isArray(directoryContents)) {
      throw new Error('Unexpected directory structure');
    }

    // Helper function to extract filename from path or object
    const getFileName = (file) => {
      if (typeof file === 'string') {
        return file.split('/').pop();
      }
      if (typeof file === 'object' && file !== null) {
        if (file.name) return file.name;
        if (file.path) return file.path.split('/').pop();
        const keys = Object.keys(file);
        if (keys.length === 1) return keys[0];
      }
      console.warn('Unexpected file format:', file);
      return null;
    };

    // Process each category
    for (const item of directoryContents) {
      if (typeof item !== 'object') continue;

      // Dynamically process each template type
      for (const type of templateTypes) {
        if (type in item) {
          for (const file of item[type]) {
            const fileName = getFileName(file);
            if (!fileName) continue;

            const key = fileName.replace('.js', '');
            groupedTemplates[type].push({
              id: key,
              url: `/${type}/${fileName}`,
              label: formatLabel(key, type, formattingRules)
            });
          }
        }
      }
    }

    return [templateTypes, groupedTemplates];
  } catch (error) {
    console.error('Error in getTemplates:', error);
    return [[], {}];
  }
};

// Helper function to format labels based on type and formatting rules
const formatLabel = (key, type, formattingRules) => {
  const typeRules = formattingRules[type] || {};
  const { remove, uppercase = true } = typeRules;

  let label = key;
  if (remove) {
    label = label.replace(new RegExp(remove, 'g'), '');
  }

  return uppercase ? label.toUpperCase() : label;
};
