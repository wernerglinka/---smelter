/**
 * @function getElementString
 * @param {nodeList} element
 * @returns a stringified array of objects
 * @description This function creates a flat array of objects from the form
 *     elements in the dropzone and returns a stringified version of the array.
 */
const getElementString = (element) => {
  // only select simple form elements
  const allFormElements = element.querySelectorAll(
    '.form-element.no-drop:not(.is-object):not(.is-array)'
  );
  const result = [];
  allFormElements.forEach((element) => {
    if (element.classList.contains('is-list')) {
      const key = element.querySelector('.label-text').innerText;
      const value = [];
      const listItems = element.querySelectorAll('ul li');
      listItems.forEach((listItem) => {
        value.push(listItem.querySelector('input').value);
      });
      result.push({ [key]: value });
    } else {
      const key = element.querySelector('.label-text').innerText;
      // check for text, textarea, checkbox, and select
      const inputElement = element.querySelector('.element-value');
      let value;
      if (inputElement.type === 'checkbox') {
        value = inputElement.checked;
      } else if (inputElement.type === 'text' || inputElement.type === 'textarea') {
        value = inputElement.value;
      }
      result.push({ [key]: value });
    }
  });
  return JSON.stringify(result);
};

/**
 * @function compareDOMElements
 * @param {*} element1
 * @param {*} element2
 * @returns true if the elements are the same, false if the elements are
 *     different structurally or in value
 */
export const compareDOMElements = (element1, element2) => {
  // First, use isEqualNode for a general structural comparison
  if (!element1.isEqualNode(element2)) {
    console.log('Different structure');
    return false;
  }

  // If the structure is the same, we need to compare the values of the form elements
  const element1String = getElementString(element1);
  const element2String = getElementString(element2);
  // compare the strings
  if (element1String !== element2String) {
    console.log('Different values');
    return false;
  }

  return true;
};
