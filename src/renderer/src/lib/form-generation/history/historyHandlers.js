/**
 * History handlers for undo/redo functionality
 */
import { logger } from '@utils/services/logger';

/**
 * Add current state to history
 *
 * @param {Object} formState - Current form state
 * @param {Array} history - History array
 * @param {number} historyPosition - Current position in history
 * @param {number} MAX_HISTORY - Maximum history entries to keep
 * @param {Function} setHistory - History setter
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 */
export const addToHistory = (
  formState,
  history,
  historyPosition,
  MAX_HISTORY,
  setHistory,
  setHistoryPosition,
  setRedoLevel
) => {
  // Skip if formState is null or undefined
  if (!formState) return;

  // Deep copy to prevent reference issues
  const snapshot = JSON.stringify(formState);

  setHistory((prevHistory) => {
    // If we're not at the end of history, truncate
    const newHistory =
      historyPosition < prevHistory.length - 1
        ? prevHistory.slice(0, historyPosition + 1)
        : [...prevHistory];

    // Limit history size to MAX_HISTORY
    const limitedHistory =
      newHistory.length >= MAX_HISTORY
        ? newHistory.slice(newHistory.length - MAX_HISTORY + 1)
        : newHistory;

    // Return updated history array
    return [...limitedHistory, snapshot];
  });

  // Update position after history is updated
  setHistoryPosition((prev) => {
    const newPosition = prev < history.length ? prev + 1 : history.length;
    setRedoLevel(newPosition);
    return newPosition;
  });
};

/**
 * Function to add an entry to history
 *
 * @param {Object} formState - Current form state
 * @param {number} historyPosition - Current position in history
 * @param {number} MAX_HISTORY - Maximum history entries to keep
 * @param {Function} setHistory - History setter
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 */
export const addHistoryEntry = (
  formState,
  historyPosition,
  MAX_HISTORY,
  setHistory,
  setHistoryPosition,
  setRedoLevel
) => {
  setHistory((prevHistory) => {
    // Create snapshot of form state
    const snapshot = JSON.stringify(formState);

    // If we're not at the end of history, truncate
    const newHistory =
      historyPosition < prevHistory.length - 1
        ? prevHistory.slice(0, historyPosition + 1)
        : [...prevHistory];

    // Limit history size
    const limitedHistory =
      newHistory.length >= MAX_HISTORY
        ? newHistory.slice(newHistory.length - MAX_HISTORY + 1)
        : newHistory;

    const newPosition = limitedHistory.length;
    // Schedule position updates
    setTimeout(() => {
      setHistoryPosition(newPosition);
      setRedoLevel(newPosition);
    }, 0);

    return [...limitedHistory, snapshot];
  });
};

/**
 * Helper function to handle form reset for undo/redo operations
 *
 * @param {Object} restoredState - State to restore
 * @param {React.MutableRefObject} formRef - Reference to form element
 * @param {Function} setFormFields - Form fields setter
 */
export const handleFormReset = (restoredState, formRef, setFormFields) => {
  logger.debug('Handling form reset using FormData');

  if (!formRef.current || !restoredState) return;

  // First update React state so components render correctly
  setFormFields(restoredState);

  // Use setTimeout to ensure the DOM has updated with new fields
  setTimeout(() => {
    const form = formRef.current;
    if (!form) return;

    // Process all fields in the restored state including nested ones
    const processFields = (fields, parentPath = '') => {
      if (!fields || !Array.isArray(fields)) return;

      fields.forEach((field, index) => {
        // Build the current path for debugging
        const currentPath = parentPath ? `${parentPath}[${index}]` : '';
        logger.debug(
          `Processing field: ${field.name || 'unnamed'}, type: ${field.type}, path: ${currentPath}`
        );

        // Handle different field types
        if (field.type === 'object' && field.fields) {
          logger.debug(`Processing object fields for ${field.name}`);
          // Recursively process object fields with updated path
          processFields(field.fields, field.name);
        } else if (field.type === 'array' && field.items) {
          logger.debug(`Processing array items for ${field.name}`);
          // Recursively process array items with updated path
          processFields(field.items, field.name);
        } else if (field.name && field.value !== undefined) {
          // Basic field with a name and value
          try {
            // Build a selector based on the parent path
            // This helps locate nested fields more precisely
            const buildNameSelector = (fieldName, parentPath) => {
              if (!parentPath) {
                return `[name="${fieldName}"]`;
              }

              // This matches the pattern: parentPath[index][fieldName]
              return `[name^="${parentPath}"][name$="[${fieldName}]"]`;
            };

            // Try different selector patterns for finding the field
            // First try with parent path context if available
            const contextSelector = parentPath
              ? buildNameSelector(field.name, parentPath)
              : `[name="${field.name}"]`;
            logger.debug(`Trying selector with context: ${contextSelector}`);
            let element = form.querySelector(contextSelector);

            // If not found, try more general patterns
            if (!element) {
              logger.debug(`Element not found with context selector, trying general patterns`);
              // Create broader selector that would match array or object nested fields
              const namePattern = field.name.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
              const nestedSelectors = [
                // Exact match (already tried above)
                `[name="${field.name}"]`,
                // Array notation: name[0], name[1], etc.
                `[name^="${field.name}["]`,
                // Fields inside arrays: parent[0][fieldName] - very important for our structure
                `[name$="[${field.name}]"]`,
                // Object notation with array parent: parent[0].name
                `[name$=".${field.name}"]`,
                // Complex nested: something[0].nested.name
                `[name*=".${field.name}."]`,
                // Last resort - any element with this name fragment
                `[name*="${namePattern}"]`
              ];

              // Try each selector pattern
              for (const selector of nestedSelectors) {
                try {
                  const elements = form.querySelectorAll(selector);
                  if (elements.length > 0) {
                    logger.debug(
                      `Found ${elements.length} elements matching selector: ${selector}`
                    );
                    // Just use the first matching element for now
                    element = elements[0];
                    break;
                  }
                } catch (err) {
                  logger.error(`Error with selector "${selector}":`, err);
                }
              }
            }

            if (!element) {
              logger.warn(`Could not find element for field ${field.name} in the DOM`);
              return; // Skip if element not found
            }

            logger.debug(`Found element for field ${field.name}, type: ${element.type}`);

            if (element.type === 'checkbox') {
              // Checkbox
              logger.debug(`Resetting checkbox ${field.name} to ${Boolean(field.value)}`);
              element.checked = Boolean(field.value);
            } else if (element.type === 'radio') {
              // Radio button
              const radio = form.querySelector(`[name="${field.name}"][value="${field.value}"]`);
              if (radio) radio.checked = true;
            } else if (element.tagName === 'SELECT') {
              // Select dropdown - handle both string and object values
              const valueToSet = field.value !== null ? field.value.toString() : '';
              element.value = valueToSet;

              // If the value wasn't set properly (might happen with complex values)
              if (element.value !== valueToSet) {
                // Try to find the option by text content
                Array.from(element.options).forEach((option) => {
                  if (option.textContent.trim() === valueToSet) {
                    element.selectedIndex = option.index;
                  }
                });
              }
            } else {
              // Regular input field
              element.value = field.value;
            }
          } catch (err) {
            logger.error(`Error updating field ${field.name}:`, err);
          }
        }
      });
    };

    // Debug: Log all form elements with their names to help debug nested fields
    logger.debug(
      'All form elements:',
      Array.from(form.querySelectorAll('[name]')).map((el) => ({
        name: el.getAttribute('name'),
        type: el.type || el.tagName.toLowerCase(),
        value: el.value
      }))
    );

    // Start processing the fields
    processFields(restoredState, '');

    logger.info('Form values restored using DOM manipulation');
  }, 50); // Give DOM time to update
};

/**
 * Handles undo action
 *
 * @param {Array} history - History array
 * @param {number} historyPosition - Current position in history
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 * @param {Function} handleFormReset - Form reset function
 */
export const handleUndo = (
  history,
  historyPosition,
  setHistoryPosition,
  setRedoLevel,
  handleFormReset
) => {
  if (historyPosition > 0) {
    const prevPosition = historyPosition - 1;
    setHistoryPosition(prevPosition);
    setRedoLevel(prevPosition);

    // Only try to parse if we have valid history at this position
    if (history[prevPosition]) {
      try {
        logger.info('Restoring state from history position:', prevPosition);

        // Parse the state from history
        const restoredState = JSON.parse(history[prevPosition]);

        // Log the restored state for debugging
        logger.debug('Restored state:', restoredState);

        // Force uncontrolled components to reset with new defaults
        handleFormReset(restoredState);
      } catch (err) {
        logger.error('Error parsing or applying history state:', err);
      }
    }
  }
};

/**
 * Handles redo action
 *
 * @param {Array} history - History array
 * @param {number} historyPosition - Current position in history
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 * @param {Function} handleFormReset - Form reset function
 */
export const handleRedo = (
  history,
  historyPosition,
  setHistoryPosition,
  setRedoLevel,
  handleFormReset
) => {
  if (historyPosition < history.length - 1) {
    const nextPosition = historyPosition + 1;
    setHistoryPosition(nextPosition);
    setRedoLevel(nextPosition);

    // Only try to parse if we have valid history at this position
    if (history[nextPosition]) {
      try {
        logger.info('Restoring state from history position:', nextPosition);

        // Parse the state from history
        const restoredState = JSON.parse(history[nextPosition]);

        // Log the restored state for debugging
        logger.debug('Restored state for redo:', restoredState);

        // Force uncontrolled components to reset with new defaults
        handleFormReset(restoredState);
      } catch (err) {
        logger.error('Error parsing or applying history state:', err);
      }
    }
  }
};
