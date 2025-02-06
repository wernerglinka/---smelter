/**
 * @module form-field-validations
 * @description Validation utilities for form field inputs
 */

/**
 * Tests if string contains only alphanumeric characters
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid
 */
export const isValidLabel = (value) => /^[a-zA-Z0-9]+$/.test(value);

/**
 * Displays error message below invalid input
 * @param {HTMLElement} element - Input element to mark as invalid
 * @param {string} message - Error message to display
 */
export const showErrorMessage = (element, message) => {
  element.classList.add('invalid');
  if (!element.nextElementSibling?.classList.contains('error-message')) {
    const errorMessage = document.createElement('span');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    element.parentNode.insertBefore(errorMessage, element.nextSibling);
  }
};

/**
 * Removes error state and message from input
 * @param {HTMLElement} element - Input element to clear error from
 */
export const removeErrorMessage = (element) => {
  element.classList.remove('invalid');
  const errorMessage = element.nextElementSibling;
  if (errorMessage?.classList.contains('error-message')) {
    errorMessage.remove();
  }
};
