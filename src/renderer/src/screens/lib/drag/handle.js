import { ICONS } from '../../icons/index.js';

/**
 * Adds drag handle to form elements
 * @param {HTMLElement} element - Element to attach drag handle to
 */
export const addDragHandle = ( element ) => {
  const dragHandle = document.createElement( 'span' );
  dragHandle.classList.add( 'sort-handle' );
  dragHandle.innerHTML = ICONS.DRAG_HANDLE;
  element.appendChild( dragHandle );
};