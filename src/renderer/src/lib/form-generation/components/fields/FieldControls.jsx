import React from 'react';
import { AddIcon, DeleteIcon } from '@components/icons';

/**
 * Renders duplicate/delete controls for form elements
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onDuplicate - Handler for duplication
 * @param {Function} props.onDelete - Handler for deletion
 * @param {boolean} props.allowDuplication - Whether duplication is allowed
 * @param {boolean} props.allowDeletion - Whether deletion is allowed
 * @returns {JSX.Element} Control buttons
 */
export const FieldControls = ({ 
  onDuplicate, 
  onDelete,
  allowDuplication = true,
  allowDeletion = true 
}) => {
  // Add debug logging for handlers and prevent event bubbling
  const handleDuplicate = (e) => {
    // Stop event propagation to prevent parent collapsing
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Duplicate button clicked', { allowDuplication, hasHandler: !!onDuplicate });
    if (onDuplicate) {
      onDuplicate();
    }
  };
  
  const handleDelete = (e) => {
    // Stop event propagation to prevent parent collapsing
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Delete button clicked', { allowDeletion, hasHandler: !!onDelete });
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div className="button-wrapper">
      {allowDuplication && (
        <div 
          className="add-button" 
          title="Duplicate this element"
          onClick={handleDuplicate}
        >
          <AddIcon />
        </div>
      )}
      {allowDeletion && (
        <div 
          className="delete-button" 
          title="Delete this element"
          onClick={handleDelete}
        >
          <DeleteIcon />
        </div>
      )}
    </div>
  );
};

export default FieldControls;