import React from 'react';
import {
  DragHandleIcon,
  AddIcon,
  DeleteIcon
} from '@components/icons';

export const BaseField = ({ children, field, allowDuplication = true, allowDeletion = true }) => {
  const labelExistsClass = field?.label ? 'label-exists' : '';

  return (
    <div className={`form-element ${labelExistsClass} no-drop`} draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      {children}
      <div className="button-wrapper">
        {allowDuplication && (
          <div className="add-button" title="Duplicate this element">
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div className="delete-button" title="Delete this element">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseField;
