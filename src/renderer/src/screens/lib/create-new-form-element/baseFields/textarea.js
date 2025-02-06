const textarea = (div, labelExists) => {
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <span>Textarea Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" ${labelExists ? 'readonly' : ''}>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Text for Textarea element</span>
      <div>
        <textarea class="element-value is-editor" placeholder="Click to open editor"></textarea>
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  // this way we preserves existing DOM structure and maintain event listeners
  while (tempContainer.firstChild) {
    div.appendChild(tempContainer.firstChild);
  }

  return div;
};

export default textarea;
