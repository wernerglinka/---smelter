import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { HelpIcon } from '@components/icons';

/**
 * Help text component
 * @param {Object} props - Component props
 * @param {string} props.text - Help text content
 * @returns {JSX.Element} Rendered component
 */



export const HelpText = ({ text }) => {
  const [show, setShow] = useState(false);

  const toggleHelp = () => {
    setShow(!show);
  };

  return (
    <div className="help-text">
      <span onClick={toggleHelp}>
        <HelpIcon />
      </span>
      {show && createPortal(
        <>
          <div className="help-text-backdrop" onClick={toggleHelp} />
          <div className="help-text-overlay">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
