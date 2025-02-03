import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const EditContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 2rem;
  min-height: calc(100vh - ${({ theme }) => theme.layout.titlebarHeight});
`;

export const Sidebar = styled.div`
  flex: 0 0 30rem;
  transition: flex 0.3s ease-in-out;
  overflow: hidden;

  ${(props) =>
    props.hidden &&
    `
    flex: 0;
    padding: 0;
  `}
`;

export const SidebarContainer = styled.div`
  background: var(--container-background);
  border-radius: 0.5rem;
  padding: 2rem 0;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 2rem;
    }
  }
`;

export const MainContent = styled.main`
  flex: 1;
  background: var(--container-background);
  border-radius: 0.5rem;
  padding: 2rem;
`;

export const PreviewPane = styled.div`
  flex: 0 0 30rem;
  background: var(--container-background);
  border-radius: 0.5rem;
  padding: 2rem;

  ${(props) =>
    !props.visible &&
    `
    display: none;
  `}
`;
