import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderTextarea
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for a textarea field
 */
export function renderTextarea(field, implicitDef) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const placeholder = helpers.getPlaceholder(implicitDef, field.placeholder);
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const hint = 'Text for Text element';
  const value = field.value || '';

  // According to the example, textarea might have class "is-editor"
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
          <textarea class="element-value is-editor ${requiredSup ? 'is-required' : ''}" placeholder="Click to open editor">${value}</textarea>
        </div>
      </label>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
