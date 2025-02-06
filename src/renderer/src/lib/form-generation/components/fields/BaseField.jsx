import React from 'react';

export const BaseField = ({
  className = '',
  children,
  allowDuplication = true,
  allowDeletion = true,
  handleDuplicate,
  handleDelete,
}) => {
  return (
    <div className={`form-element ${className} label-exists no-drop`} draggable={true}>
      <span className="sort-handle">
        <svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
            <g stroke="#FFFFFF" strokeWidth="2">
              <circle cx="4" cy="11" r="1"/>
              <circle cx="4" cy="4" r="1"/>
              <circle cx="4" cy="18" r="1"/>
              <circle cx="10" cy="11" r="1"/>
              <circle cx="10" cy="4" r="1"/>
              <circle cx="10" cy="18" r="1"/>
            </g>
          </g>
        </svg>
      </span>

      {children}

      <div className="button-wrapper">
        {allowDuplication && (
          <div className="add-button button" onClick={handleDuplicate}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                <g stroke="#000000" strokeWidth="2">
                  <g transform="translate(2, 2)">
                    <circle cx="10" cy="10" r="10"/>
                    <line x1="6" y1="10" x2="14" y2="10"/>
                    <line x1="10" y1="6" x2="10" y2="14"/>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        )}
        {allowDeletion && (
          <div className="delete-button" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round">
                <g stroke="#000000" strokeWidth="2">
                  <g transform="translate(2, 2)">
                    <circle cx="10" cy="10" r="10"/>
                    <line x1="13" y1="7" x2="7" y2="13"/>
                    <line x1="7" y1="7" x2="13" y2="13"/>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseField;
