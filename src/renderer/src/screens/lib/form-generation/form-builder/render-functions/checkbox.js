import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderCheckbox
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for a checkbox field
 */

export function renderCheckbox(field, implicitDef) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const hint = 'Initial state of checkbox';
  const value = field.value === true ? 'true' : 'false';
  const placeholder = field.placeholder || 'Text Placeholder';

  return `<div class="form-element null label-exists no-drop" draggable="true">
      ${renderFunctions.renderSortHandleHTML()}
      <label class="label-wrapper">
        <span>${label}${requiredSup}</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" value="${label}" readonly>
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${hint}</span>
        <div>
          <input type="checkbox" role="switch" class="element-value ${requiredSup ? 'is-required' : ''}" value="${value}" placeholder="${placeholder}" ${field.value ? 'checked' : ''}>
        </div>
      </label>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
