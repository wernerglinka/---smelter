import renderFunctions from './render-functions/index.js';

/**
 * @function buildForm
 * Transform a given incoming schema (derived from YAML frontmatter) into an HTML form.
 * This function also takes an implicitSchema (explicit schema) that provides overrides
 * and additional detail.
 *
 * @param {Object} incomingSchema - Incoming schema object as shown in the prompt.
 * @param {Object[]} implicitSchema - Array of field definitions.
 * @return {string} HTML string representing the form.
 * @use const html = buildForm(incomingSchema, explicitSchema);
 */

export function buildForm(incomingSchema, implicitSchema) {
  // The main function that renders a field based on its type.
  // For fields that differ in type: text, checkbox, select, etc.
  // We'll assume incoming fields have "type" (text, checkbox, object, list, array)
  // and if implicit schema differs, we override

  // Render top-level fields:
  const fieldsHTML = incomingSchema.fields
    .map((field) => renderFunctions.renderField(field, implicitSchema))
    .join('');

  // return HTML string
  return fieldsHTML;
}
