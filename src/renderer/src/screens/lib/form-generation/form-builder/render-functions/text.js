import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderText
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for a text field
 */
export function renderText(field, implicitDef) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const placeholder = helpers.getPlaceholder(implicitDef, field.placeholder);
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const hint =
    implicitDef && implicitDef.label
      ? `Text for ${implicitDef.label} element`
      : 'Text for Text element';
  const value = field.value || '';

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
          <input type="${(implicitDef && implicitDef.type) || 'text'}" class="element-value ${requiredSup ? 'is-required' : ''}" placeholder="${placeholder}" value="${value}">
        </div>
      </label>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
