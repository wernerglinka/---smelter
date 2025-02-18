import React, { useEffect, useRef } from 'react';
import { useDragState, useDragStateDispatch } from './DragStateContext';

export const GhostElement = () => {
  const ghostRef = useRef(null);
  const { isDragging, position, insertionPoint, currentDropzone } = useDragState();
  const dispatch = useDragStateDispatch();

  useEffect(() => {
    if (ghostRef.current) {
      dispatch({ type: 'SET_GHOST', payload: ghostRef.current });
    }
  }, [dispatch]);

  if (!isDragging || !currentDropzone) return null;

  let ghostStyle = {
    position: 'fixed', // Changed to fixed positioning
    pointerEvents: 'none',
    zIndex: 9999,
    height: '2px',
    backgroundColor: 'var(--accent-color, #4a9eff)',
    left: '0',
    right: '0',
    transition: 'transform 0.1s ease-out'
  };

  if (insertionPoint?.closest) {
    const element = insertionPoint.closest;
    const rect = element.getBoundingClientRect();
    ghostStyle.top = insertionPoint.position === 'before'
      ? `${rect.top}px`
      : `${rect.bottom}px`;
  } else if (currentDropzone) {
    const rect = currentDropzone.getBoundingClientRect();
    ghostStyle.top = `${rect.bottom - 2}px`;
  }

  console.log('Rendering ghost element with style:', ghostStyle); // Debug log

  return (
    <div
      ref={ghostRef}
      className="ghost-element"
      style={ghostStyle}
      data-testid="ghost-element" // For debugging
    />
  );
};
