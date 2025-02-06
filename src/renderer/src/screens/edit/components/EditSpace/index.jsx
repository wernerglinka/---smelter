import React from 'react';
import './styles.css';

const EditSpace = ({ $expanded = false, fileContent }) => {
  return (
    <div className={`edit-space ${$expanded ? 'expanded' : ''}`}>
      {fileContent ? (
        <div>
          <h3>File Type: {fileContent.type}</h3>
          <h4>File Path: {fileContent.path}</h4>
          <pre>
            {JSON.stringify(fileContent.data, null, 2)}
          </pre>
        </div>
      ) : (
        <div>Select a file to edit</div>
      )}
    </div>
  );
};

export default EditSpace;
