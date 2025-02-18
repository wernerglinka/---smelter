import React, { memo } from 'react';
import './styles.css';

const templateCategories = {
  blocks: [
    { id: 'text-block', name: 'Text Block', type: 'block' },
    { id: 'image-block', name: 'Image Block', type: 'block' },
    { id: 'code-block', name: 'Code Block', type: 'block' }
  ],
  sections: [
    { id: 'content-section', name: 'Content Section', type: 'section' },
    { id: 'hero-section', name: 'Hero Section', type: 'section' }
  ],
  pages: [
    { id: 'article-page', name: 'Article Page', type: 'page' },
    { id: 'landing-page', name: 'Landing Page', type: 'page' }
  ]
};

const Templates = memo(({ category = 'blocks' }) => {
  const handleDragStart = (e, template) => {
    e.currentTarget.classList.add('dragging');

    const dragData = {
      type: 'template',
      template: template
    };

    e.dataTransfer.setData('origin', 'templates');
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';

    // Optional: Set drag image
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.classList.add('drag-image');
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
  };

  return (
    <div className="templates-container">
      <ul className="templates-list">
        {templateCategories[category].map(template => (
          <li
            key={template.id}
            className="template-item"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, template)}
            onDragEnd={handleDragEnd}
          >
            {template.name}
          </li>
        ))}
      </ul>
    </div>
  );
});

Templates.displayName = 'Templates';

export default Templates;
