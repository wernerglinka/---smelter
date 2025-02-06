import { ICONS } from '../../../icons/index.js';

const array = (div, labelExists) => {
  const tempContainer = document.createElement('div');
  tempContainer.className = `form-element is-array no-drop ${labelExists ? 'label-exists' : ''}`;
  tempContainer.draggable = true;

  tempContainer.innerHTML = `
    <label class="object-name label-wrapper">
      <span>Array Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Array Name" ${labelExists ? 'readonly' : ''}>
      <span class="collapse-icon">
        ${ICONS.COLLAPSE}
        ${ICONS.COLLAPSED}
      </span>
    </label>
    <div class="array-dropzone dropzone js-dropzone" data-wrapper="is-array"></div>
    <div class="button-wrapper"></div>
  `;

  // Append children of tempContainer to the div
  // this way we preserves existing DOM structure and maintain event listeners
  while (tempContainer.firstChild) {
    div.appendChild(tempContainer.firstChild);
  }

  return div;
};

export default array;
