export const getInsertionPoint = (dropzone, y) => {
  const elements = Array.from(dropzone.querySelectorAll(':scope > .form-element'));
  let closest = null;
  let position = 'after';

  if (elements.length === 0) {
    return { closest: null, position: 'after' };
  }

  const dropzoneRect = dropzone.getBoundingClientRect();

  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;

    if (y < midpoint) {
      closest = element;
      position = 'before';
      break;
    }

    if (element === elements[elements.length - 1]) {
      closest = element;
      position = 'after';
    }
  }

  return { closest, position };
};

export const createGhostElement = () => {
  const ghost = document.createElement('div');
  ghost.className = 'ghost-element';
  ghost.style.height = '2px';
  ghost.style.background = '#0066cc';
  ghost.style.margin = '8px 0';
  return ghost;
};

export const recordElementPositions = (dropzone) => {
  const elements = dropzone.querySelectorAll('.form-element');
  const positions = new Map();

  elements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    positions.set(element, {
      top: rect.top,
      left: rect.left
    });
  });

  return positions;
};
