import { StorageOperations } from '@services/storage';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

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

export const getTemplates = async () => {
  try {
    const projectPath = StorageOperations.getProjectPath();
    if (!projectPath) {
      throw new Error('Project path not found in storage');
    }

    // Define template types directly
    const templateTypes = ['pages', 'sections', 'blocks'];
    const groupedTemplates = Object.fromEntries(templateTypes.map((type) => [type, []]));

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

    const directoryContents = templatesData[templatesPath];
    if (!Array.isArray(directoryContents)) {
      throw new Error('Unexpected directory structure');
    }

    // Process each category
    for (const item of directoryContents) {
      if (typeof item !== 'object') continue;

      // Process each template type
      for (const type of templateTypes) {
        if (type in item) {
          for (const file of item[type]) {
            const fileName = getFileName(file);
            if (!fileName) continue;

            const key = fileName.replace('.json', '');
            groupedTemplates[type].push({
              id: key,
              url: `/${type}/${fileName}`,
              label: toTitleCase(key)
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
