import { ICONS } from '../../../icons/index.js';

const object = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="object-name label-wrapper ${ labelExists ? "label-exists" : "" }">
      <span>Object Label<sup>*</sup></span>
      <span class="hint">Sections Object</span>
      <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
      <span class="collapse-icon">
        ${ ICONS.COLLAPSE }
        ${ ICONS.COLLAPSED }
      </span>
    </label>
    <div class="object-dropzone dropzone js-dropzone" data-wrapper="is-object"></div>
  `;

  // Append children of tempContainer to the div
  // this way we preserves existing DOM structure and maintain event listeners
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }

  return div;
};

export default object;