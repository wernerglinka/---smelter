/**
 * Sets up the styles for the editor overlay
 * @returns {Function} Cleanup function to remove styles
 */
export const setupEditorStyles = () => {
  const style = document.createElement('style');
  style.id = 'editor-overlay-styles';

  style.textContent = `
    #editorOverlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s, visibility 0.3s;
    }

    #editorOverlay.show {
      opacity: 1;
      visibility: visible;
    }

    /* Prevent body scrolling when overlay is active */
    body.has-overlay {
      overflow: hidden;
    }

    #editorContainer {
      width: 90%;
      height: 80%;
      display: flex;
      flex-direction: column;
    }

    #editorWrapper {
      width: 100%;
      height: 100%;
      flex: 1;
    }

    #closeEditor {
      position: absolute;
      top: 20px;
      right: 20px;
      color: #333;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      -webkit-user-select: none;
      font-weight: bold;
      border: 1px solid #ccc;
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }

    #disableMarkdownStyles {
      background: #f0f0f0;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }

    #disableMarkdownStyles.disabled {
      background: #ccc;
    }

    .disable-markdown-styles .cm-header,
    .disable-markdown-styles .cm-strong,
    .disable-markdown-styles .cm-em {
      font-weight: normal !important;
      font-style: normal !important;
      font-size: inherit !important;
    }

    /* Make editor take full height of container */
    .EasyMDEContainer, .CodeMirror {
      height: 100% !important;
    }
  `;

  document.head.appendChild(style);

  // Return cleanup function
  return () => {
    if (document.head.contains(style)) {
      document.head.removeChild(style);
    }
  };
};
