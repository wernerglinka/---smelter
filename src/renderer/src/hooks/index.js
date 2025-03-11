// Re-export hooks from context for backward compatibility
export { useProject } from '../context/ProjectContext';
export { useSidebar } from '../context/SidebarContext';
export { useError } from '../context/ErrorContext';
export { useFormOperations } from '../context/FormOperationsContext';
export { useValidation } from '../context/ValidationContext';
export { useDragState, useDragStateDispatch } from '../lib/drag-drop/DragStateContext';

// Additional utility hooks
export { useAsyncOperation } from './useAsyncOperation';
export { useFormSubmission } from './useFormSubmission';
export { useFormValidation } from './useFormValidation';

// Add other hooks here as they are created