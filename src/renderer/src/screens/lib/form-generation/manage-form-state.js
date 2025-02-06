import helpers from './form-builder/helpers/index.js';

// Core validation functions
const validateLabelInput = (value) => {
  if (!value) return false;

  // convert from nice label to camelCase
  // e.g. `helpers.toCamelCase( value )` rather than `value`
  const camelCaseValue = helpers.toCamelCase(value);
  const labelRegex = /^[A-Za-z0-9]{2,}$/;
  return labelRegex.test(camelCaseValue);
};

const validateValueInput = (input) => {
  if (!input) return false;

  const value = input.value.trim();
  // Use tagName for select elements, otherwise use type
  const type = input.tagName.toLowerCase() === 'select' ? 'select' : input.type;

  const validators = {
    text: (value) => value.length > 0,
    textarea: (value) => value.length > 0,
    number: (value) => !isNaN(value) && value !== '',
    url: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    checkbox: () => true,
    select: (value, input) => {
      const hasSelection = value !== '';
      const selectedOptionExists = Array.from(input.getElementsByTagName('option')).some(
        (option) => option.value === value
      );
      return hasSelection && selectedOptionExists;
    }
  };

  return validators[type] ? validators[type](value, input) : false;
};

// Field presence check
const hasFields = (dropzone) => {
  return dropzone.querySelectorAll('.form-element').length > 0;
};

// Form validation
const isFormValid = (dropzone) => {
  const fields = dropzone.querySelectorAll('.form-element');

  if (fields.length === 0) {
    console.log('Form invalid: No fields found');
    return false;
  }

  return Array.from(fields).every((field) => {
    // Check if it's an object wrapper or regular field
    const isObject = field.classList.contains('is-object');
    const isArray = field.classList.contains('is-array');
    const isList = field.classList.contains('is-list');
    const isRequired = field.classList.contains('is-required');

    // Skip validation for object/array wrappers - they are containers
    if (isObject || isArray || isList) {
      return true;
    }

    const labelInput = field.querySelector('.element-label');
    const valueInput = field.querySelector('.element-value');

    // Get field name for better error messages
    const fieldName = field.querySelector('.label-wrapper span')?.textContent || 'Unknown field';

    // Always validate label if it has a value
    const labelValue = labelInput.value;
    const isLabelValid = !labelValue || validateLabelInput(labelValue);
    if (!isLabelValid) {
      console.log(
        `Label validation failed for "${fieldName}": Value "${labelValue}" does not match pattern (min 2 chars, A-Z, a-z, 0-9, no spaces)`
      );
      labelInput.classList.add('is-error');
    } else {
      labelInput.classList.remove('is-error');
    }

    // Only require value validation for required fields or fields with values
    const valueRequired = isRequired || valueInput.value.trim().length > 0;
    const isValueValid = !valueRequired || validateValueInput(valueInput);
    if (!isValueValid) {
      console.log(
        `Value validation failed for "${fieldName}": Type "${valueInput.type}", Value "${valueInput.value}"`
      );
      valueInput.classList.add('is-error');
    } else {
      valueInput.classList.remove('is-error');
    }

    return isLabelValid && isValueValid;
  });
};

// Button state updates
const updateButtonStates = (form) => {
  const dropzone = form.querySelector('#dropzone');
  const submitButton = form.querySelector('[type="submit"]');
  const clearButton = form.querySelector('#clear-dropzone');

  submitButton.disabled = !isFormValid(dropzone);
  clearButton.disabled = !hasFields(dropzone);
};

// Clear dropzone handler
const clearDropzone = (dropzone) => {
  dropzone.innerHTML = '';

  // reset any active links in the sidebar
  const activeSidebarLink = document.querySelector('.sidebar .dom-tree a.active');
  if (activeSidebarLink) {
    activeSidebarLink.classList.remove('active');
  }
};

// Initialize form manager
export const initFormManager = (formId) => {
  const form = document.getElementById(formId);
  if (!form) {
    console.error('Form not found:', formId);
    return;
  }

  const dropzone = form.querySelector('#dropzone');
  if (!dropzone) {
    console.error('Dropzone not found in form:', formId);
    return;
  }

  // Mark required fields
  const markRequiredFields = () => {
    const fields = dropzone.querySelectorAll('.form-element');
    fields.forEach((field) => {
      const hasAsterisk = field.querySelector('.label-wrapper span sup');
      if (hasAsterisk) {
        field.classList.add('is-required');
      }
    });
  };

  // Initial setup
  markRequiredFields();

  // Set up event listeners
  form.addEventListener('input', () => updateButtonStates(form));

  clearButton.addEventListener('click', () => {
    clearDropzone(dropzone);
    updateButtonStates(form);
  });

  // Initial button state update
  updateButtonStates(form);

  // Return functions that might be useful externally
  return {
    validateLabel: validateLabelInput,
    validateValue: validateValueInput,
    updateStates: () => updateButtonStates(form),
    clear: () => {
      clearDropzone(dropzone);
      updateButtonStates(form);
    }
  };
};
