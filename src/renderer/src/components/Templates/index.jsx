import React, { memo } from 'react';
import { templates } from '@src/templates';
import './styles.css';

const Templates = memo(() => {
  // Group templates by type
  const groupedTemplates = Object.entries(templates).reduce((acc, [key, value]) => {
    if (key.startsWith('page')) {
      acc.pages.push({ id: key, url: `/pages/${key}.js`, label: key.replace('page', '').toUpperCase() });
    } else if (key.endsWith('Section')) {
      acc.sections.push({ id: key, url: `/sections/${key}.js`, label: key.replace('Section', '').toUpperCase() });
    } else {
      acc.blocks.push({ id: key, url: `/blocks/${key}.js`, label: key.toUpperCase() });
    }
    return acc;
  }, { pages: [], sections: [], blocks: [] });

  return (
    <div className="templates-wrapper">
      <h3 className="section-header">Page Templates</h3>
      {groupedTemplates.pages.map((template, index) => (
        <div
          key={template.id}
          id={`template-page-${index + 1}`}
          className="template-selection draggable"
          draggable="true"
          data-url={template.url}
        >
          {template.label}
        </div>
      ))}

      <h3 className="section-header">Section Templates</h3>
      {groupedTemplates.sections.map((template, index) => (
        <div
          key={template.id}
          id={`template-section-${index}`}
          className="template-selection draggable"
          draggable="true"
          data-url={template.url}
        >
          {template.label}
        </div>
      ))}

      <h3 className="section-header">Block Templates</h3>
      {groupedTemplates.blocks.map((template, index) => (
        <div
          key={template.id}
          id={`template-block-${index}`}
          className="template-selection draggable"
          draggable="true"
          data-url={template.url}
        >
          {template.label}
        </div>
      ))}
    </div>
  );
});

Templates.displayName = 'Templates';

export default Templates;
