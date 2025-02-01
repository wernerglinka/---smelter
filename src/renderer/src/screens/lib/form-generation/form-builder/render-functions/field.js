import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderField
 * @param {*} field 
 * @returns The HTML string for a field
 */
export function renderField( field, implicitSchema ) {
  const fieldName = field.label;
  const implicitDef = helpers.findImplicitDefinition( fieldName, implicitSchema );

  // Determine element type
  let elementType = field.type;
  if ( implicitDef && implicitDef.type ) {
    elementType = implicitDef.type;
  }

  // Common wrappers and classes:
  // form-element, label-wrapper, content-wrapper, etc.
  // The provided HTML structure is quite extensive. We’ll try to mimic it.
  // For simplicity, we’ll handle just a few field types as examples:
  switch ( elementType ) {
    case 'text':
    case 'url':
    case 'number':
    case 'image':
      return renderFunctions.renderText( field, implicitDef );
    case 'textarea':
      return renderFunctions.renderTextarea( field, implicitDef );
    case 'checkbox':
      return renderFunctions.renderCheckbox( field, implicitDef );
    case 'select':
      return renderFunctions.renderSelect( field, implicitDef );
    case 'object':
      return renderFunctions.renderObject( field, implicitDef, implicitSchema );
    case 'list':
      return renderFunctions.renderList( field, implicitDef );
    case 'array':
      return renderFunctions.renderArray( field, implicitDef, implicitSchema );
    default:
      // default fallback: treat as text
      return renderFunctions.renderText( field, implicitDef );
  }
}