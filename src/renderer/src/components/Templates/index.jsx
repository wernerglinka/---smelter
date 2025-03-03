import React, { memo, useState, useEffect } from 'react';
import { getTemplates } from './getTemplates';
import './styles.css';

const Templates = memo(() => {
  const [templateTypes, setTemplateTypes] = useState([]);
  const [groupedTemplates, setGroupedTemplates] = useState({});
  const [activeType, setActiveType] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [types, grouped] = await getTemplates();
        setTemplateTypes(types);
        setGroupedTemplates(grouped);
        if (types.length > 0 && !activeType) {
          setActiveType(types[0]);
        }
      } catch (error) {
        console.error('Failed to load templates:', error);
        setTemplateTypes([]);
        setGroupedTemplates({});
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateDragStart = (e, template) => {
    const templateUrl = template.dataset.url;

    e.dataTransfer.setData('origin', 'template');
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'template',
      url: templateUrl
    }));

    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTemplateDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div className="templates-wrapper">
      <div className="template-tabs">
        {templateTypes.map(type => (
          <button
            key={type}
            className={`template-tab ${activeType === type ? 'active' : ''}`}
            onClick={() => setActiveType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="template-list">
        {templateTypes.map(type => (
          <div
            key={type}
            className={`template-type-group ${activeType === type ? 'active' : ''}`}
          >
            <div>
              {groupedTemplates[type]?.map((template, index) => (
                <div
                  key={template.id}
                  id={`template-${type}-${index}`}
                  className="template-selection draggable"
                  draggable="true"
                  data-url={template.url}
                  onDragStart={(e) => handleTemplateDragStart(e, e.currentTarget)}
                  onDragEnd={handleTemplateDragEnd}
                >
                  {/* Display the filename without extension and path */}
                  {template.label || template.url.split('/').pop().split('.')[0]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

Templates.displayName = 'Templates';

export default Templates;
