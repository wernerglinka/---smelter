import { ICONS } from '../../../icons/index.js';

const list = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper object-name">
      <span>List Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
    </label>
    <ul>
      <li>
        <input type="text" class="list-item" placeholder="Item Placeholder">
        <div class="button-wrapper">
          <div class="add-button button">
            ${ ICONS.ADD }
          </div>
          <div class="delete-button button">
            ${ ICONS.DELETE }
          </div>
        </div>
      </li>
    </ul>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }

  return div;

};

export default list;