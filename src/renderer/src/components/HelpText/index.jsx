import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpIcon } from '@components/icons';

/**
 * Help text component
 * @param {Object} props - Component props
 * @param {string} props.text - Help text content
 * @returns {JSX.Element} Rendered component
 */

export const HelpText = ( { text } ) => {
  const [show, setShow] = useState(false);

  const toggleHelp = () => {
    setShow(!show);
  };

  return (
    <div className="help-text">
      <span onClick={ toggleHelp }>
        <HelpIcon />
      </span>
      {show && createPortal(
        <>
          <div className="help-text-backdrop" onClick={toggleHelp} />
          <p className="help-text-overlay">{text}</p>
        </>,
        document.body
      )}
    </div>
  );
};
