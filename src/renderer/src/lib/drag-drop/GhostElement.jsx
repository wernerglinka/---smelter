import React, { useEffect, useRef } from 'react';
import { useDragState, useDragStateDispatch } from './DragStateContext';

/**
 * GhostElement component provides visual feedback during drag operations
 * Shows a placement indicator for drag targets with proper scroll compensation
 *
 * @returns {JSX.Element|null} The ghost element or null when not dragging
 */
export const GhostElement = () => {
  const ghostRef = useRef(null);
  const { isDragging, position, insertionPoint, currentDropzone } = useDragState();
  const dispatch = useDragStateDispatch();

  // Set the ghost element reference
  useEffect(() => {
    if (ghostRef.current) {
      dispatch({ type: 'SET_GHOST', payload: ghostRef.current });
    }
  }, [dispatch]);

  // Clean up ghost element on component unmount
  useEffect(() => {
    return () => {
      if (isDragging) {
        dispatch({ type: 'CLEAR_DRAG_STATE' });
      }
    };
  }, [isDragging, dispatch]);

  // Don't render anything if not in dragging state or no dropzone
  if (!isDragging || !currentDropzone) return null;

  let ghostStyle = {
    position: 'absolute', // Changed from 'fixed' to 'absolute'
    pointerEvents: 'none',
    zIndex: 9999,
    height: '4px',
    backgroundColor: 'var(--accent-color, #4a9eff)',
    left: '0',
    right: '0',
    transition: 'all 0.1s ease-out',
    boxShadow: '0 0 4px rgba(74, 158, 255, 0.5)',
    transform: 'scaleY(1)'
  };

  // Add animation when position changes
  if (insertionPoint?.closest) {
    const element = insertionPoint.closest;
    const rect = element.getBoundingClientRect();

    // Get scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    // Calculate position based on insertion point, accounting for scroll
    if (insertionPoint.position === 'before') {
      ghostStyle.top = `${rect.top + scrollY}px`; // Add scroll offset
      ghostStyle.transform = 'scaleY(1)';
      ghostStyle.marginTop = '-2px';
    } else {
      ghostStyle.top = `${rect.bottom + scrollY}px`; // Add scroll offset
      ghostStyle.transform = 'scaleY(1)';
      ghostStyle.marginTop = '-2px';
    }

    // Match the width of the target element, accounting for horizontal scroll
    ghostStyle.left = `${rect.left + scrollX}px`; // Add horizontal scroll offset
    ghostStyle.right = 'auto';
    ghostStyle.width = `${rect.width}px`;
  } else if (currentDropzone) {
    // When hovering over an empty dropzone
    const rect = currentDropzone.getBoundingClientRect();

    // Get scroll position
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    ghostStyle.top = `${rect.bottom - 2 + scrollY}px`; // Add scroll offset
    ghostStyle.left = `${rect.left + scrollX}px`; // Add horizontal scroll offset
    ghostStyle.width = `${rect.width}px`;
    ghostStyle.backgroundColor = 'var(--accent-color-secondary, #2cc974)';
  }

  return (
    <div ref={ghostRef} className="ghost-element" style={ghostStyle} data-testid="ghost-element">
      <div className="ghost-element-indicator" />
    </div>
  );
};
