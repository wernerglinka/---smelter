import { ICONS } from '../../icons/index.js';

/**
 * Creates action buttons (add/delete) for form elements
 * @param {HTMLElement} element - Parent element to attach buttons to
 * @param {Object} options - Button configuration
 * @param {boolean} options.addDeleteButton - Whether to show delete button
 * @param {boolean} options.addDuplicateButton - Whether to show duplicate button
 */
export const addActionButtons = (element, { addDeleteButton, addDuplicateButton }) => {
  const buttonWrapper = document.createElement('div');
  buttonWrapper.classList.add('button-wrapper');

  if (addDuplicateButton) {
    buttonWrapper.appendChild(createAddButton());
  }

  if (addDeleteButton) {
    buttonWrapper.appendChild(createDeleteButton());
  }

  element.appendChild(buttonWrapper);
};

const createAddButton = () => {
  const button = document.createElement('div');
  button.classList.add('add-button', 'button');
  button.innerHTML = ICONS.ADD;
  return button;
};

const createDeleteButton = () => {
  const button = document.createElement('div');
  button.classList.add('delete-button');
  button.innerHTML = ICONS.DELETE;
  return button;
};
