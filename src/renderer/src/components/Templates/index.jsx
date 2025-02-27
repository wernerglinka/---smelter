import React, { memo } from 'react';
import { templates } from '@src/templates';
import templateTypes from '@src/templates/types.json';
import './styles.css';

const Templates = memo(() => {
  // Initialize groupedTemplates using types from JSON
  const groupedTemplates = templateTypes.reduce((acc, type) => {
    acc[type] = [];
    return acc;
  }, {});

  // Group templates by type
  Object.entries(templates).reduce((acc, [key, value]) => {
    if (key.startsWith('page')) {
      acc.pages.push({ id: key, url: `/pages/${key}.js`, label: key.replace('page', '').toUpperCase() });
    } else if (key.endsWith('Section')) {
      acc.sections.push({ id: key, url: `/sections/${key}.js`, label: key.replace('Section', '').toUpperCase() });
    } else {
      acc.blocks.push({ id: key, url: `/blocks/${key}.js`, label: key.toUpperCase() });
    }
    return acc;
  }, groupedTemplates);

  return (
    <div className="templates-wrapper">
      {templateTypes.map(type => (
        <div key={type}>
          <h3 className="section-header">{`${type.charAt(0).toUpperCase() + type.slice(1)} Templates`}</h3>
          {groupedTemplates[type].map((template, index) => (
            <div
              key={template.id}
              id={`template-${type}-${index}`}
              className="template-selection draggable"
              draggable="true"
              data-url={template.url}
            >
              {template.label}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

Templates.displayName = 'Templates';

export default Templates;
