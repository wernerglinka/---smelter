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
}