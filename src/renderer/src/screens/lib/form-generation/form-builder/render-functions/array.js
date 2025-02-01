import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderArray
 * @param {*} field 
 * @param {*} implicitDef 
 * @returns The HTML string for an array field
 */

export function renderArray( field, implicitDef, implicitSchema ) {
  // Arrays are similar to objects, but represent an ordered collection of objects.
  // Typically you'll have multiple object-like items inside `field.value`.
  // Convert the label to a pretty title case
  const label = helpers.toTitleCase( helpers.getLabel( field ) );
  const requiredSup = helpers.getRequiredSup( implicitDef );
  const hint = ( implicitDef && implicitDef.label ) ? `${ implicitDef.label } Array` : 'Sections Array';

  const isColumn = field.label === 'column';

  const innerFields = field.value.map( subField => renderFunctions.renderField( subField, implicitSchema ) ).join( '' );

  return `<div class="form-element is-array label-exists no-drop" draggable="true">
      ${ renderFunctions.renderSortHandleHTML() }
      <label class="object-name label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <input type="text" class="element-label" placeholder="Array Name" value="${ label }" readonly>
        ${ renderFunctions.renderCollapseButtonsHTML() }
      </label>
      <div class="array-dropzone dropzone js-dropzone is-collapsed" data-wrapper="${ isColumn ? 'is-column' : 'is-array' }">
        ${ innerFields }
      </div>
      ${ renderFunctions.renderButtonWrapperHTML( implicitDef ) }
    </div>`;
}