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
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 9999,
    height: '4px', // Increased height for better visibility
    backgroundColor: 'var(--accent-color, #4a9eff)',
    left: '0',
    right: '0',
    transition: 'all 0.1s ease-out',
    boxShadow: '0 0 4px rgba(74, 158, 255, 0.5)', // Added subtle glow
    transform: 'scaleY(1)'
  };

  // Add animation when position changes
  if (insertionPoint?.closest) {
    const element = insertionPoint.closest;
    const rect = element.getBoundingClientRect();

    // Calculate position based on insertion point
    if (insertionPoint.position === 'before') {
      ghostStyle.top = `${rect.top}px`;
      // Add visual indicator for "before" position
      ghostStyle.transform = 'scaleY(1)';
      ghostStyle.marginTop = '-2px';
    } else {
      ghostStyle.top = `${rect.bottom}px`;
      // Add visual indicator for "after" position
      ghostStyle.transform = 'scaleY(1)';
      ghostStyle.marginTop = '-2px';
    }

    // Match the width of the target element
    ghostStyle.left = `${rect.left}px`;
    ghostStyle.right = 'auto';
    ghostStyle.width = `${rect.width}px`;
  } else if (currentDropzone) {
    // When hovering over an empty dropzone
    const rect = currentDropzone.getBoundingClientRect();
    ghostStyle.top = `${rect.bottom - 2}px`;
    ghostStyle.left = `${rect.left}px`;
    ghostStyle.width = `${rect.width}px`;
    ghostStyle.backgroundColor = 'var(--accent-color-secondary, #2cc974)'; // Different color for empty dropzone
  }

  return (
    <div
      ref={ghostRef}
      className="ghost-element"
      style={ghostStyle}
      data-testid="ghost-element"
    >
      <div className="ghost-element-indicator" /> {/* Optional: Add an arrow or additional visual indicator */}
    </div>
  );
};
