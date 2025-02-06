import { renderAddButtonHTML } from './add-button.js';
import { renderDeleteButtonHTML } from './delete-button.js';

/**
 * @function renderButtonWrapperHTML
 * @returns Button wrapper HTML string with icons
 */
export function renderButtonWrapperHTML(implicitDef) {
  // By default, assume no buttons
  let addBtn = '';
  let deleteBtn = '';

  // Only render add button if noDuplication is NOT true
  if (!implicitDef || !implicitDef.noDuplication) {
    addBtn = renderAddButtonHTML();
  }

  // Only render delete button if noDeletion is NOT true
  if (!implicitDef || !implicitDef.noDeletion) {
    deleteBtn = renderDeleteButtonHTML();
  }

  // If no buttons, return an empty wrapper to maintain structure
  if (!addBtn && !deleteBtn) {
    return '<div class="button-wrapper"></div>';
  }

  return `<div class="button-wrapper">${addBtn}${deleteBtn}</div>`;
}
