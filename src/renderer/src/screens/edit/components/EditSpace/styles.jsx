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
`;