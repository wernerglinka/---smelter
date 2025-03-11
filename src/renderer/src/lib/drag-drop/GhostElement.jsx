import React, { useEffect, useRef } from 'react';
import { useDragState } from './DragStateContext';
import './ghost-element.css';

/**
 * GhostElement component provides visual feedback during drag operations
 * Uses DOM methods to create and position an element directly in the body
 * 
 * @returns {null} This component doesn't render anything in the React tree
 */
export const GhostElement = () => {
  const { isDragging, insertionPoint, currentDropzone } = useDragState();
  const ghostElementRef = useRef(null);
  
  // Create and manage ghost element
  useEffect(() => {
    // Create ghost element
    const ghostElement = document.createElement('div');
    ghostElement.className = 'ghost-indicator';
    ghostElement.style.display = 'none';
    document.body.appendChild(ghostElement);
    ghostElementRef.current = ghostElement;
    
    // Position update function
    const updatePosition = () => {
      if (!isDragging || !ghostElementRef.current) {
        ghostElement.style.display = 'none';
        return;
      }
      
      if (insertionPoint?.closest) {
        // Position near targeted element
        const element = insertionPoint.closest;
        const rect = element.getBoundingClientRect();
        
        ghostElement.style.display = 'block';
        ghostElement.style.position = 'absolute';
        ghostElement.style.width = `${rect.width}px`;
        ghostElement.style.height = '4px';
        ghostElement.style.backgroundColor = '#4a9eff';
        ghostElement.style.zIndex = '9999';
        ghostElement.style.pointerEvents = 'none';
        ghostElement.style.boxShadow = '0 0 4px rgba(74, 158, 255, 0.5)';
        
        // Position based on insertion point
        if (insertionPoint.position === 'before') {
          ghostElement.style.top = `${rect.top + window.scrollY - 2}px`;
        } else {
          ghostElement.style.top = `${rect.bottom + window.scrollY + 2}px`;
        }
        
        ghostElement.style.left = `${rect.left + window.scrollX}px`;
      } else {
        // Hide ghost element when not over a valid target
        ghostElement.style.display = 'none';
      }
    };
    
    // Mousemove handler for cursor tracking
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      if (currentDropzone && !insertionPoint?.closest) {
        // When over a dropzone without a specific target element
        const rect = currentDropzone.getBoundingClientRect();
        
        ghostElement.style.display = 'block';
        ghostElement.style.position = 'absolute';
        ghostElement.style.width = `${rect.width}px`;
        ghostElement.style.height = '4px';
        ghostElement.style.backgroundColor = '#2cc974';
        ghostElement.style.zIndex = '9999';
        ghostElement.style.pointerEvents = 'none';
        ghostElement.style.boxShadow = '0 0 4px rgba(44, 201, 116, 0.5)';
        
        // Follow cursor Y position when over dropzone
        const cursorPosition = e.clientY + window.scrollY;
        ghostElement.style.top = `${cursorPosition}px`;
        ghostElement.style.left = `${rect.left + window.scrollX}px`;
      }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', updatePosition);
    
    // Update interval
    const updateInterval = setInterval(updatePosition, 50);
    
    // Initial update
    updatePosition();
    
    // Cleanup
    return () => {
      clearInterval(updateInterval);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', updatePosition);
      
      if (ghostElement.parentNode) {
        ghostElement.parentNode.removeChild(ghostElement);
      }
    };
  }, [isDragging, insertionPoint, currentDropzone]);
  
  return null;
};