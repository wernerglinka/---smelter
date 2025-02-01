import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.header};
  margin-bottom: 2rem;
`;

export const StyledButton = styled.button`
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background-color: ${(props) =>
    props.primary ? props.theme.colors.attention : 'var(--info-background)'};
  color: ${(props) => (props.primary ? '#ffffff' : props.theme.colors.text)};
  box-shadow: var(--drop-shadow);
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
    background-color: var(--btn-hover);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
`;

export const StyledLink = styled(Link)`
  ${StyledButton}
  text-decoration: none;
`;

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
  padding: 2rem;
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
