const text = (div, labelExists) => {
  console.log('basefield for text');
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <span>Text Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" ${labelExists ? 'readonly' : ''}>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Text for Text element</span>
      <div>
        <input type="text" class="element-value" placeholder="Text Placeholder">
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  while (tempContainer.firstChild) {
    div.appendChild(tempContainer.firstChild);
  }

  return div;
};

export default text;
