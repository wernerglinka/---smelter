import React from 'react';
import {
  DragHandleIcon,
  AddIcon,
  DeleteIcon
} from '@components/icons';

export const BaseField = ({ children, allowDuplication = true, allowDeletion = true }) => {
  return (
    <div className="form-element label-exists no-drop" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      {children}
      <div className="button-wrapper">
        {allowDuplication && (
          <div className="add-button button">
            <AddIcon />
          </div>
        )}
        {allowDeletion && (
          <div className="delete-button">
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseField;
