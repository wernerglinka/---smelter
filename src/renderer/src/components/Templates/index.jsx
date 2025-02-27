import React, { memo, useState, useEffect } from 'react';
import { getTemplates } from './getTemplates';
import './styles.css';

const Templates = memo( () => {

  const [templateTypes, groupedTemplates] = getTemplates();

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
