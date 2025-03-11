/**
 * Snapshot-related handlers for the form editor
 */
import { logger } from '@utils/services/logger';

/**
 * Handles creating a named snapshot
 *
 * @param {Array} formFields - Current form fields
 * @param {Array} snapshots - Current snapshots array
 * @param {Function} setSnapshots - Snapshots state setter
 */
export const handleCreateSnapshot = (formFields, snapshots, setSnapshots) => {
  if (!formFields) return;

  const timestamp = new Date().toLocaleTimeString();
  const name = `Snapshot ${snapshots.length + 1} (${timestamp})`;

  const snapshot = {
    name,
    state: JSON.stringify(formFields),
    timestamp: new Date().toISOString()
  };

  setSnapshots((prev) => [...prev, snapshot]);

  // Inform user
  logger.info(`Created snapshot: ${name}`);

  // Show a temporary message
  const messageElement = document.createElement('div');
  messageElement.className = 'snapshot-message';
  messageElement.textContent = `Snapshot created: ${name}`;
  document.body.appendChild(messageElement);

  // Remove after 3 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement);
    }
  }, 3000);
};

/**
 * Handles restoring a snapshot
 *
 * @param {number} index - Index of the snapshot to restore
 * @param {Array} snapshots - Snapshots array
 * @param {number} historyPosition - Current history position
 * @param {Function} handleFormReset - Function to reset the form
 * @param {Function} setHistory - History state setter
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 */
export const handleRestoreSnapshot = (
  index,
  snapshots,
  historyPosition,
  handleFormReset,
  setHistory,
  setHistoryPosition,
  setRedoLevel
) => {
  if (index >= 0 && index < snapshots.length) {
    try {
      const restoredFields = JSON.parse(snapshots[index].state);

      // Use the form reset function to properly update both state and DOM
      handleFormReset(restoredFields);

      // Add this restoration to history by directly updating
      // to avoid potential circular dependencies with addToHistory
      setHistory((prevHistory) => {
        // If we're not at the end of history, truncate
        const newHistory =
          historyPosition < prevHistory.length - 1
            ? prevHistory.slice(0, historyPosition + 1)
            : [...prevHistory];

        // Return updated history with snapshot state
        return [...newHistory, snapshots[index].state];
      });

      // Update position
      setHistoryPosition((prev) => prev + 1);
      setRedoLevel((prev) => prev + 1);

      // Inform user
      logger.info(`Restored snapshot: ${snapshots[index].name}`);
    } catch (err) {
      logger.error('Error restoring snapshot:', err);
    }
  }
};
