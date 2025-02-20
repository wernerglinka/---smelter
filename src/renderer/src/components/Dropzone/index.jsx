import React, { useCallback, useRef } from 'react';
import { useDragState, useDragStateDispatch } from '@lib/drag-drop/DragStateContext';

const DEBUG = true;

function logDebug(...args) {
  if (DEBUG) {
    console.log('[Dropzone]', ...args);
  }
}

export const Dropzone = ({ children, className = '', onDrop, type = 'main' }) => {
  const dropzoneRef = useRef(null);
  const dragState = useDragState();
  const dispatch = useDragStateDispatch();
  const lastPosition = useRef(null);

  const isObjectDropzone = className.includes('object-dropzone');
  const dataWrapper = isObjectDropzone ? 'is-object' : undefined;

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only log if position has changed significantly (more than 10px)
    const currentPos = { x: e.clientX, y: e.clientY };
    if (!lastPosition.current ||
        Math.abs(currentPos.x - lastPosition.current.x) > 10 ||
        Math.abs(currentPos.y - lastPosition.current.y) > 10) {
      lastPosition.current = currentPos;
      console.log('[Dropzone] Position changed:', currentPos);
    }

    // Calculate insertion point
    const rect = dropzoneRef.current.getBoundingClientRect();
    const children = Array.from(dropzoneRef.current.children);
    let closestChild = null;
    let closestDistance = Infinity;
    let position = 'after';

    children.forEach(child => {
      const childRect = child.getBoundingClientRect();
      const childMiddle = childRect.top + (childRect.height / 2);
      const distance = Math.abs(e.clientY - childMiddle);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestChild = child;
        position = e.clientY < childMiddle ? 'before' : 'after';
      }
    });

    // Update drag state with current dropzone, position and insertion point
    dispatch({
      type: 'UPDATE_DRAG_STATE',
      payload: {
        isDragging: true,
        currentDropzone: dropzoneRef.current,
        position: {
          x: e.clientX,
          y: e.clientY
        },
        insertionPoint: closestChild ? {
          closest: closestChild,
          position: position
        } : null
      }
    });

    // Add visual feedback
    dropzoneRef.current?.classList.add('drag-over');
  }, [dispatch]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Only remove the class if we're leaving the dropzone itself
    if (e.target === dropzoneRef.current) {
      dropzoneRef.current?.classList.remove('drag-over');
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch({
      type: 'SET_CURRENT_DROPZONE',
      payload: dropzoneRef.current
    });
  }, [dispatch]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dropzoneRef.current?.classList.remove('drag-over');

    if (e.currentTarget !== e.target.closest('.dropzone')) {
      return;
    }

    try {
      const origin = e.dataTransfer.getData('origin');
      console.log('Drop - origin:', origin);

      let data;
      try {
        data = JSON.parse(e.dataTransfer.getData('application/json'));
        console.log('Drop - parsed data:', data);
      } catch (err) {
        data = e.dataTransfer.getData('text/plain');
        console.log('Drop - text data:', data);
      }

      if (onDrop && data) {
        onDrop({
          type: origin || type,
          data,
          position: {
            x: e.clientX,
            y: e.clientY,
            targetIndex: dragState.insertionPoint?.closest ?
              Array.from(e.currentTarget.children).indexOf(dragState.insertionPoint.closest) +
              (dragState.insertionPoint.position === 'after' ? 1 : 0) : -1
          }
        });
      }
    } catch (error) {
      console.error('Drop handling error:', error);
    }

    dispatch({ type: 'CLEAR_DRAG_STATE' });
  }, [onDrop, type, dispatch, dragState]);

  return (
    <div
      ref={dropzoneRef}
      className={`dropzone ${className}`}
      data-wrapper={dataWrapper}
      data-testid="dropzone"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
};

export default Dropzone;

