import styled from 'styled-components';

export const NewProjectContainer = styled.div`
  padding: 20px;
`;

export const MessageContainer = styled.div`
  margin-bottom: 20px;
`;

export const FolderSelectionArea = styled.div`
  margin: 20px 0;

  > div {
    margin-bottom: 15px;
  }
`;

export const ProjectFolderDisplay = styled.div`
  margin: 20px 0;
  font-size: 14px;

  strong {
    font-weight: 600;
  }

  span {
    margin-left: 8px;
  }
`;

export const FolderPath = styled.div`
  font-size: 14px;

  strong {
    font-weight: 600;
  }

  span {
    margin-left: 8px;
  }
`;

export const ButtonContainer = styled.div`
  margin-top: 20px;

  button {
    margin-right: 10px;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;
