import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const WelcomeContainer = styled.div`
  max-width: 80rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;

  img {
    max-width: 15rem;
    margin-bottom: 5rem;
  }
`;

export const ProjectList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 5rem 0 0;
`;

export const ProjectItem = styled.li`
  margin-bottom: 1rem;
`;

export const ProjectLink = styled(Link)`
  color: ${({ theme }) => theme.colors.attention};
  display: flex;
  align-items: center;
  text-decoration: none;

  strong {
    padding: 0 0.5rem;
  }

  svg {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;

    g {
      stroke: ${({ theme }) => theme.colors.attention};
    }
  }

  &.preview {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }
`;

export const ListHeader = styled.li`
  color: ${({ theme }) => theme.colors.attention};
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.2rem;
  text-transform: uppercase;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const RecentProjectItem = styled(ListHeader)`
  margin-top: 3rem;
`;

export const RecentProjectLink = styled(ProjectLink)`
  padding-left: 2rem;
`;