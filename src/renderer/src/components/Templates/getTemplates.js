import { templates } from '@src/templates';
import templateTypes from '@src/templates/types.json';

export const getTemplates = () => {
  // Initialize groupedTemplates using types from JSON
  const groupedTemplates = templateTypes.reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {});

  // Group templates by type
  Object.entries(templates).reduce((acc, [key, value]) => {
    if (key.startsWith('page')) {
      acc.pages.push({
        id: key,
        url: `/pages/${key}.js`,
        label: key.replace('page', '').toUpperCase()
      });
    } else if (key.endsWith('Section')) {
      acc.sections.push({
        id: key,
        url: `/sections/${key}.js`,
        label: key.replace('Section', '').toUpperCase()
      });
    } else {
      acc.blocks.push({ id: key, url: `/blocks/${key}.js`, label: key.toUpperCase() });
    }
    return acc;
  }, groupedTemplates);

  return [templateTypes, groupedTemplates];
};
