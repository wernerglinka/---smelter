import styled from 'styled-components';

export const EditSpaceContainer = styled.div`
  flex: 0 0 120rem;
  will-change: transform;
  transition: transform 0.8s ease-in-out;
  min-height: 80vh;

  #main-form {
    position: relative;
    width: 100%;
    padding-bottom: 3rem;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;

    &.fade-out {
      opacity: 0;
    }
  }

  #undo-redo-wrapper {
    position: absolute;
    top: -3rem;
    right: 0.4rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    z-index: 1000;

    .btn {
      padding: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.5s ease-in-out;
      opacity: 1;
      pointer-events: all;
    }

    svg {
      width: 1.6rem;

      * {
        stroke: ${({ theme }) => theme.colors.text};
      }
    }

    .undo[disabled],
    .redo[disabled],
    .snapshot[disabled] {
      opacity: 0.3;
      pointer-events: none;
    }

    .undo-redo-message,
    .undo-redo-count {
      font-size: 1.2rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.message};
    }
  }
`;