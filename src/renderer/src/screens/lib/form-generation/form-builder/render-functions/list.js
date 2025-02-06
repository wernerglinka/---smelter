import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderList
 * @description Renders a list field, basically an array with string items
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for a list field
 */

export function renderList(field, implicitDef) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const items = field.value || [];
  const itemsHTML = items
    .map((itemValue) => {
      return `<li>
        <input type="text" class="list-item" placeholder="Item Placeholder" value="${itemValue}">
        ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
      </li>`;
    })
    .join('');

  return `<div class="form-element is-list label-exists no-drop" draggable="true">
      ${renderFunctions.renderSortHandleHTML()}
      <label class="label-wrapper object-name">
        <span>${label}${requiredSup}</span>
        <input type="text" class="element-label" placeholder="Label Placeholder" value="${label}" readonly>
      </label>
      <ul>
        ${itemsHTML}
      </ul>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
