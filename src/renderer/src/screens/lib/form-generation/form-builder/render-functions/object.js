import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderObject
 * @param {*} field
 * @param {*} implicitDef
 * @returns The HTML string for an object field
 */

export function renderObject(field, implicitDef, implicitSchema) {
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase(helpers.getLabel(field));
  const requiredSup = helpers.getRequiredSup(implicitDef);
  const hint = implicitDef && implicitDef.label ? `${implicitDef.label} Object` : 'Sections Object';

  /*
   * If there is a `sectionDescription` field in the object we will use it to add a description
   * to the section. This is useful when a section is collapsed and the description is the only
   * info available to the user. The alternative is to open any section to find out what it is.
   */
  // Check if the field is an object and has a value array
  let hasDescription = false;
  let descriptionField;
  if (field.type === 'object' && Array.isArray(field.value)) {
    // Find the sub-field with label 'sectionDescription'
    descriptionField = field.value.find((subField) => subField.label === 'sectionDescription');
    hasDescription = descriptionField && descriptionField.value;
  }

  // Render nested fields
  const innerFields = field.value
    .map((subField) => renderFunctions.renderField(subField, implicitSchema))
    .join('');

  return `<div class="form-element is-object label-exists no-drop" draggable="true">
      ${renderFunctions.renderSortHandleHTML()}
      <label class="object-name label-wrapper label-exists">
        <span>${label}${requiredSup}</span>
        <span class="hint">${hint}</span>
        ${hasDescription ? `<span class="section-description">${descriptionField.value}</span>` : ''}
        <input type="text" class="element-label" placeholder="Label Placeholder" value="${label}" readonly>
        ${renderFunctions.renderCollapseButtonsHTML()}
      </label>
      <div class="object-dropzone dropzone js-dropzone is-collapsed" data-wrapper="is-object">
        ${innerFields}
      </div>
      ${renderFunctions.renderButtonWrapperHTML(implicitDef)}
    </div>`;
}
