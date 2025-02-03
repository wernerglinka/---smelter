import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const TitleBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  height: ${({ theme }) => theme.layout.titlebarHeight};
  width: 100%;
  -webkit-user-select: none;
  -webkit-app-region: drag;
  cursor: move;
`;

export const PageTitle = styled.h1`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  color: ${({ theme }) => theme.colors.header};
  margin-bottom: 2rem;

  a {
    margin-left: auto;
  }
`;

export const Button = styled.a`
  display: inline-block;
  padding: 1rem 2rem;
  margin: 0 0.5rem;
  border-radius: ${({ theme }) => theme.layout.borderRadius};
  border: none;
  background-color: ${(props) =>
    props.primary ? props.theme.colors.attention : props.theme.colors.background.info};
  color: ${(props) => (props.primary ? '#ffffff' : props.theme.colors.text)};
  box-shadow: ${({ theme }) => theme.effects.dropShadow};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: bold;
  text-transform: uppercase;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease-in-out;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  pointer-events: ${(props) => (props.disabled ? 'none' : 'auto')};
  text-decoration: none;

  &:hover {
    transform: ${(props) => !props.disabled && 'scale(1.05)'};
    background-color: ${(props) => !props.disabled && 'var(--btn-hover)'};
  }

  &:active {
    transform: ${(props) => !props.disabled && 'scale(0.95)'};
  }
`;

export const StyledLink = styled(Link)`
  ${Button}
`;

export const GlassContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.whiteTransparent};
  border-radius: ${({ theme }) => theme.layout.borderRadius};
  box-shadow: ${({ theme }) => theme.effects.dropShadow};
  backdrop-filter: ${({ theme }) => theme.effects.backdropBlur};
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: ${({ theme }) => theme.layout.elementPadding};
`;
