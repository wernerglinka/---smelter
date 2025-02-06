import React from 'react';
import { PreviewContainer } from './styles';

const PreviewPane = () => {
  return (
    <PreviewContainer className="js-preview-pane">
      <div className="preview-content">
        <div className="js-preview-content"></div>
      </div>
    </PreviewContainer>
  );
};

export default PreviewPane;
