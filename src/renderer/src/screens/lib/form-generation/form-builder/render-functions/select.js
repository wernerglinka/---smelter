import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderSelect
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for a select field
 */

export function renderSelect(field, implicitDef) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const hint =
    implicitDef && implicitDef.label
      ? `Text for ${implicitDef.label} element`
      : 'Text for Text element';
  const options = (implicitDef && implicitDef.options) || [];
  const currentValue = field.value || implicitDef.default || '';

  const optionsHTML = options
    .map((opt) => {
      const selected = opt.value === currentValue ? 'selected' : '';
      return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
    })
    .join('');

  return `<div class="form-element null label-exists no-drop" draggable="true">
      ${renderFunctions.renderSortHandleHTML()}
      <label class="label-wrapper">
        <span>${label}${requiredSup}</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" value="${label}"  readonly>
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${hint}</span>
        <div>
          <select class="element-value ${requiredSup ? 'is-required' : ''}">${optionsHTML}</select>
        </div>
      </label>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
