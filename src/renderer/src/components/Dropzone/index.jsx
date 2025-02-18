import React, { useCallback, useRef } from 'react';
import { useDragStateDispatch } from '@lib/drag-drop/DragStateContext';

export const Dropzone = ({ children, className = '', onDrop, type = 'main' }) => {
  const dropzoneRef = useRef(null);
  const dispatch = useDragStateDispatch();

  const isObjectDropzone = className.includes('object-dropzone');
  const dataWrapper = isObjectDropzone ? 'is-object' : undefined;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only handle drop if we're the direct dropzone target
    if (e.currentTarget !== e.target.closest('.dropzone')) {
      return;
    }

    try {
      const origin = e.dataTransfer.getData('origin');
      let data;
      try {
        data = JSON.parse(e.dataTransfer.getData('application/json'));
      } catch (err) {
        data = e.dataTransfer.getData('text/plain');
      }

      if (onDrop && data) {
        const formElement = e.target.closest('.form-element');
        const targetIndex = formElement
          ? Array.from(e.currentTarget.children).indexOf(formElement)
          : -1;

        onDrop({
          type: origin || type,
          data,
          position: {
            x: e.clientX,
            y: e.clientY,
            targetIndex
          }
        });
      }
    } catch (error) {
      console.error('Drop handling error:', error);
    }
  }, [onDrop, type]);

  return (
    <div
      ref={dropzoneRef}
      className={`dropzone ${className}`}
      data-wrapper={dataWrapper}
      data-testid="dropzone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default Dropzone;

