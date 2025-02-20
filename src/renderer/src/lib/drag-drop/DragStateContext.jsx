import React, { createContext, useContext, useReducer } from 'react';

const DragStateContext = createContext();
const DragStateDispatchContext = createContext();

const initialState = {
  isDragging: false,
  currentDropzone: null,
  position: null,
  insertionPoint: null,
  ghostElement: null
};

function dragStateReducer(state, action) {
  // Only log non-UPDATE_DRAG_STATE actions and only log CLEAR_DRAG_STATE once
  if (action.type !== 'UPDATE_DRAG_STATE' &&
      !(action.type === 'CLEAR_DRAG_STATE' && state.isDragging === false)) {
    console.log('[DragState]', action.type, action.payload);
  }

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
      // Only clear if we're actually dragging
      if (!state.isDragging) return state;
      return initialState;

    default:
      return state;
  }
}

export function DragStateProvider({ children }) {
  const [state, dispatch] = useReducer(dragStateReducer, initialState);

  return (
    <DragStateContext.Provider value={state}>
      <DragStateDispatchContext.Provider value={dispatch}>
        {children}
      </DragStateDispatchContext.Provider>
    </DragStateContext.Provider>
  );
}

export function useDragState() {
  const context = useContext(DragStateContext);
  if (context === undefined) {
    throw new Error('useDragState must be used within a DragStateProvider');
  }
  return context;
}

export function useDragStateDispatch() {
  const context = useContext(DragStateDispatchContext);
  if (context === undefined) {
    throw new Error('useDragStateDispatch must be used within a DragStateProvider');
  }
  return context;
}
