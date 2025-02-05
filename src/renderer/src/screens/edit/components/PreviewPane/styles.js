import styled from 'styled-components';

export const PreviewContainer = styled.div`
  padding: 0;
  flex: 0 0 0;
  overflow: hidden;
  transition: all 0.5s ease-in-out;

  .preview-pane {
    height: 100%;
    font-size: 1.2rem;
    font-family: monospace;
  }

  &.active {
    padding-left: 1.5rem;
    flex: 0 0 20%;
    min-width: 30rem;
  }
`;