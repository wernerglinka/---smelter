import React, { createContext, useContext, useReducer } from 'react';

const DragStateContext = createContext();
const DragStateDispatchContext = createContext();

const initialDragState = {
  isDragging: false,
  position: null,
  insertionPoint: null,
  ghostElement: null,
  currentDropzone: null,
  draggedElement: null,
  lastUpdate: 0
};

function dragStateReducer(state, action) {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        draggedElement: action.payload
      };

    case 'UPDATE_DRAG_STATE':
      return {
        ...state,
        ...action.payload,
        lastUpdate: Date.now()
      };

    case 'SET_DROPZONE':
      return {
        ...state,
        currentDropzone: action.payload
      };

    case 'SET_GHOST':
      return {
        ...state,
        ghostElement: action.payload
      };

    case 'RESET':
      return {
        ...initialDragState,
        lastUpdate: Date.now()
      };

    default:
      return state;
  }
}

export function DragStateProvider({ children }) {
  const [state, dispatch] = useReducer(dragStateReducer, initialDragState);

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
