/*
/src/renderer/src/context/index.jsx

Central context management file that organizes and exports all the React Context
providers used in the application.

Imports:
The file imports various context providers from separate files, including:
  ErrorProvider - Likely handles application-wide error states
  ProjectProvider - Manages project-related state
  SidebarProvider - Handles sidebar UI state
  DragStateProvider - Manages drag-and-drop functionality
  FormOperationsProvider - Handles form-related operations
  ValidationProvider - Manages form/data validation
Exports:
The file re-exports all context-related components and hooks using named exports.
  Each context module exports three items: the Context object, Provider component,
  and a custom hook
  For example:  ErrorContext,  ErrorProvider, and  useError
  DragStateContext Re-export: Special re-export of the drag-and-drop context from
  a different location (lib/drag-drop) for maintaining compatibility
  AppProviders Component: A compound component that nests all context providers in a specific order:
  ErrorProvider
    └── ProjectProvider
        └── SidebarProvider
              └── DragStateProvider
                  └── ValidationProvider
                        └── FormOperationsProvider
This hierarchy ensures that:
  Error handling is available at all levels
  Project context is available to all UI components
  Form operations have access to validation and drag-state
  Child components can access any context they need
This structure follows the React Context composition pattern, allowing state
management to be distributed across the application while maintaining clear
boundaries between different concerns.
*/

import React from 'react';
import { ErrorProvider } from './ErrorContext';
import { ProjectProvider } from './ProjectContext';
import { SidebarProvider } from './SidebarContext';
import { DragStateProvider } from '../lib/drag-drop/DragStateContext';
import { FormOperationsProvider } from './FormOperationsContext';
import { ValidationProvider } from './ValidationContext';

// Export all contexts
export { ErrorContext, ErrorProvider, useError } from './ErrorContext';
export { FormOperationsContext, FormOperationsProvider, useFormOperations } from './FormOperationsContext';
export { ProjectContext, ProjectProvider, useProject } from './ProjectContext';
export { SidebarContext, SidebarProvider, useSidebar } from './SidebarContext';
export { ValidationContext, ValidationProvider, useValidation } from './ValidationContext';

// Re-export DragStateContext for compatibility
export {
  DragStateContext,
  DragStateProvider,
  useDragState,
  useDragStateDispatch
} from '../lib/drag-drop/DragStateContext';

/**
 * AppProviders - Wraps application with all required context providers
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AppProviders({ children }) {
  return (
    <ErrorProvider>
      <ProjectProvider>
        <SidebarProvider>
          <DragStateProvider>
            <ValidationProvider>
              <FormOperationsProvider>
                {children}
              </FormOperationsProvider>
            </ValidationProvider>
          </DragStateProvider>
        </SidebarProvider>
      </ProjectProvider>
    </ErrorProvider>
  );
};
