import styled from 'styled-components';

export const SidebarContainer = styled.div`
  padding: 1rem 2rem 2rem;
  background: var(--white-transparent);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  margin-bottom: 2rem;

  ul {
    list-style: none;
    padding: 2rem 0 0;
    margin: 0;

    button {
      display: block;
      width: 100%;
      font-size: 1.2rem;
      text-align: left;
      margin-bottom: 2rem;
      opacity: 1;
      pointer-events: all;
      cursor: pointer;
      transition: opacity 0.3s ease-in-out;

      &.active {
        opacity: 0.5;
        pointer-events: none;
        cursor: default;
      }
    }
  }
`;

export const PaneContainer = styled.div`
  padding: 1rem;
  display: ${({ active }) => active ? 'block' : 'none'};

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.6rem;
    font-weight: 500;
  }
`;

export const Hint = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  background: var(--color-background-white-transparent);
  border-radius: 0.4rem;

  p {
    margin: 0;
    font-size: 1.4rem;
    color: var(--color-text-light);
  }
`;
