import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { setupGlobalDragListeners } from './utils';

export const DragStateContext = createContext();
export const DragStateDispatchContext = createContext();

const initialState = {
  isDragging: false,
  currentDropzone: null,
  position: null,
  insertionPoint: null,
  ghostElement: null
};

function dragStateReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_DRAG_STATE':
      return {
        ...state,
        ...action.payload,
        isDragging: true
      };

    case 'SET_CURRENT_DROPZONE':
      return {
        ...state,
        currentDropzone: action.payload
      };

    case 'SET_GHOST':
      return {
        ...state,
        ghostElement: action.payload
      };

    case 'CLEAR_DRAG_STATE':
      // Always ensure ghost element is properly cleared
      return initialState;

    default:
      return state;
  }
}

/**
 * Provider component for drag state management
 * Sets up global event handlers and provides drag state context
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component with children
 */
export function DragStateProvider({ children }) {
  const [state, dispatch] = useReducer(dragStateReducer, initialState);

  // Set up global drag event listeners
  useEffect(() => {
    return setupGlobalDragListeners(dispatch);
  }, []);

  return (
    <DragStateContext.Provider value={state}>
      <DragStateDispatchContext.Provider value={dispatch}>
        {children}
      </DragStateDispatchContext.Provider>
    </DragStateContext.Provider>
  );
}

/**
 * Hook to access the current drag state
 * @returns {Object} Current drag state
 */
export function useDragState() {
  const context = useContext(DragStateContext);
  if (context === undefined) {
    throw new Error('useDragState must be used within a DragStateProvider');
  }
  return context;
}

/**
 * Hook to access the drag state dispatch function
 * @returns {Function} Dispatch function for drag state actions
 */
export function useDragStateDispatch() {
  const context = useContext(DragStateDispatchContext);
  if (context === undefined) {
    throw new Error('useDragStateDispatch must be used within a DragStateProvider');
  }
  return context;
}
