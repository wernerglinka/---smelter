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
      data: templateTypes,
      error: typesError
    } = await window.electronAPI.files.read(typesPath);

    if (typesStatus === 'failure') {
      throw new Error(`Failed to read template types: ${typesError}`);
    }

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
        // If it's an object with a name property
        if (file.name) return file.name;
        // If it's an object with a path property
        if (file.path) return file.path.split('/').pop();
        // If it's an object with a single key-value pair
        const keys = Object.keys(file);
        if (keys.length === 1) return keys[0];
      }
      console.warn('Unexpected file format:', file);
      return null;
    };

    // Process each category
    for (const item of directoryContents) {
      if (typeof item !== 'object') continue;

      // Handle blocks directory
      if ('blocks' in item) {
        for (const blockFile of item.blocks) {
          const fileName = getFileName(blockFile);
          if (!fileName) continue;

          const key = fileName.replace('.js', '');
          groupedTemplates.blocks.push({
            id: key,
            url: `/blocks/${fileName}`,
            label: key.toUpperCase()
          });
        }
      }

      // Handle pages directory
      if ('pages' in item) {
        for (const pageFile of item.pages) {
          const fileName = getFileName(pageFile);
          if (!fileName) continue;

          const key = fileName.replace('.js', '');
          groupedTemplates.pages.push({
            id: key,
            url: `/pages/${fileName}`,
            label: key.replace('page', '').toUpperCase()
          });
        }
      }

      // Handle sections directory
      if ('sections' in item) {
        for (const sectionFile of item.sections) {
          const fileName = getFileName(sectionFile);
          if (!fileName) continue;

          const key = fileName.replace('.js', '');
          groupedTemplates.sections.push({
            id: key,
            url: `/sections/${fileName}`,
            label: key.replace('Section', '').toUpperCase()
          });
        }
      }
    }

    return [templateTypes, groupedTemplates];
  } catch (error) {
    console.error('Error in getTemplates:', error);
    return [[], {}];
  }
};
