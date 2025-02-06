import { addDragHandle } from '../drag/handle.js';
import baseField from './baseFields/index.js';

/**
 * @function createComponent
 * @param {string} type - text, checkbox, array, object, etc.
 * @param {boolean} labelsExist - if false, return the raw component with the label as an input field
 * @returns {HTMLElement} a form element
 */
export function createComponent(type, labelsExist) {
  console.log(`Creating component of type: ${type}`);
  let elementModifier = null;
  if (type === 'object') {
    elementModifier = 'is-object';
  }
  if (type === 'array' || type === 'sectionsArray') {
    elementModifier = 'is-array';
  }
  if (type === 'list') {
    elementModifier = 'is-list';
  }

  // create a div to hold the form element
  let div = document.createElement('div');
  // Add classes to the div
  div.className = `form-element ${elementModifier} ${labelsExist ? 'label-exists' : ''} no-drop`;
  // Make element draggable but nothing can be dropped into it
  div.setAttribute('draggable', true);

  // Temp element storage so I know what type of element I'm dragging
  window.draggedElement = null;

  // Add a drag handle
  addDragHandle(div);

  // Call the form component function to create the base element
  div = baseField[type](div, labelsExist);

  return div;
}
