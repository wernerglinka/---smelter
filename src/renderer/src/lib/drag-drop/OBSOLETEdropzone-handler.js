export const initializeDropzones = (container) => {
  const dropzones = container.querySelectorAll('.dropzone');

  dropzones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
  });
};

const handleDrop = (e) => {
  e.preventDefault();
  
  const draggedElement = document.querySelector('.dragging');
  const dropzone = e.target.closest('.dropzone');
  
  if (!dropzone || !draggedElement) return;

  const insertPosition = getDropPosition(dropzone, e.clientY);
  
  if (insertPosition.target) {
    insertPosition.target.insertAdjacentElement(
      insertPosition.position, 
      draggedElement
    );
  } else {
    dropzone.appendChild(draggedElement);
  }

  updateFormStructure(dropzone);
};

const updateFormStructure = (dropzone) => {
  // Update name/path attributes to reflect new structure
  const fields = dropzone.querySelectorAll('.form-element');
  fields.forEach((field, index) => {
    updateFieldAttributes(field, index);
  });
};