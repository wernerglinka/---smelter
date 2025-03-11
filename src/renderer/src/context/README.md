# State Management in Smelter

This directory contains the standardized context-based state management system for Smelter. The approach is designed to:

1. Maintain uncontrolled form components for performance
2. Provide consistent error handling
3. Share state efficiently across components
4. Support proper loading states
5. Standardize access patterns

## Contexts Overview

### ErrorContext

Provides application-wide error handling with standardized error reporting. Use this for all error management to ensure consistent error handling across the application.

```jsx
import { useError } from '@/context';

function MyComponent() {
  const { setError, clearError, handleError } = useError();
  
  try {
    // Do something that might fail
  } catch (error) {
    handleError(error, 'myOperation');
  }
}
```

### FormOperationsContext

Provides form operations while maintaining uncontrolled form components. This context doesn't store form state itself (which remains in the DOM), but provides standardized operations for working with form fields.

```jsx
import { useFormOperations } from '@/context';

function FormField({ name }) {
  const { getValue, setValue, validateField } = useFormOperations();
  
  const handleChange = (e) => {
    setValue(name, e.target.value);
  };
}
```

### ProjectContext

Manages the current project's state, including loading and saving project data. Use this for all project-related operations.

```jsx
import { useProject } from '@/context';

function ProjectInfo() {
  const { projectName, projectPath, loadProject } = useProject();
  
  return <h1>Current Project: {projectName}</h1>;
}
```

### SidebarContext

Manages sidebar visibility and active pane state. Use this to control sidebar-related UI.

```jsx
import { useSidebar } from '@/context';

function SidebarToggle() {
  const { isVisible, toggleSidebar } = useSidebar();
  
  return (
    <button onClick={toggleSidebar}>
      {isVisible ? 'Hide' : 'Show'} Sidebar
    </button>
  );
}
```

### DragStateContext

Manages drag-and-drop operations using the reducer pattern. This implementation provides optimized rendering with separate contexts for state and dispatch.

```jsx
import { useDragState, useDragStateDispatch } from '@/context';

function DraggableItem() {
  const { isDragging } = useDragState();
  const dispatch = useDragStateDispatch();
  
  // Use drag state and dispatch actions
}
```

## Using the Providers

The contexts are designed to be nested in a specific order to handle dependencies. Use the provided `AppProviders` component to wrap your application:

```jsx
import { AppProviders } from '@/context';

function App() {
  return (
    <AppProviders>
      <YourAppContent />
    </AppProviders>
  );
}
```

## Custom Hooks vs. Context

- Use context for shared state that needs to be accessed by many components
- Use custom hooks for component-specific logic that doesn't need global state
- Combine both approaches when component logic needs to access global state

## Migration Strategy

When migrating from the old state management pattern:

1. Replace direct DOM manipulation with FormOperationsContext
2. Replace direct console.error calls with useError()
3. Replace the old useProject/useSidebar hooks with the new context-based versions
4. Maintain the DragStateContext pattern which was already well-implemented