/**
 * Unit tests for the snapshot handlers
 */
import {
  handleCreateSnapshot,
  handleRestoreSnapshot
} from '../../../../src/renderer/src/lib/form-generation/history/snapshotHandlers';

describe('Snapshot Handler Functions', () => {
  // Mock DOM methods
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const mockMessageElement = {
    className: '',
    textContent: '',
    parentNode: {
      removeChild: jest.fn()
    }
  };

  beforeAll(() => {
    document.createElement = jest.fn().mockReturnValue(mockMessageElement);
    document.body.appendChild = jest.fn();
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCreateSnapshot', () => {
    it('should not create a snapshot if form fields are null', () => {
      // Arrange
      const formFields = null;
      const snapshots = [];
      const setSnapshots = jest.fn();

      // Act
      handleCreateSnapshot(formFields, snapshots, setSnapshots);

      // Assert
      expect(setSnapshots).not.toHaveBeenCalled();
    });

    it('should add a new snapshot with form state', () => {
      // Arrange
      const formFields = [{ id: 'field1', name: 'title', value: 'Test Title' }];
      const snapshots = [];
      const setSnapshots = jest.fn();

      // Mock Date methods for consistent testing
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      const originalToISOString = Date.prototype.toISOString;
      Date.prototype.toLocaleTimeString = jest.fn().mockReturnValue('12:34:56');
      Date.prototype.toISOString = jest.fn().mockReturnValue('2023-01-01T12:34:56Z');

      // Act
      handleCreateSnapshot(formFields, snapshots, setSnapshots);

      // Assert
      expect(setSnapshots).toHaveBeenCalled();

      // Get the callback passed to setSnapshots
      const updateCallback = setSnapshots.mock.calls[0][0];
      const newSnapshots = updateCallback([]);

      // Check the new snapshot was created correctly
      expect(newSnapshots).toHaveLength(1);
      expect(newSnapshots[0].name).toBe('Snapshot 1 (12:34:56)');
      expect(newSnapshots[0].state).toBe(JSON.stringify(formFields));
      expect(newSnapshots[0].timestamp).toBe('2023-01-01T12:34:56Z');

      // Restore Date methods
      Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
      Date.prototype.toISOString = originalToISOString;
    });

    it('should create a notification message element', () => {
      // Arrange
      const formFields = [{ id: 'field1', name: 'title', value: 'Test' }];
      const snapshots = [];
      const setSnapshots = jest.fn();

      // Mock Date for consistent testing
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      Date.prototype.toLocaleTimeString = jest.fn().mockReturnValue('12:34:56');

      // Act
      handleCreateSnapshot(formFields, snapshots, setSnapshots);

      // Assert
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockMessageElement.className).toBe('snapshot-message');
      expect(mockMessageElement.textContent).toContain('Snapshot created');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockMessageElement);

      // Check timeout for removing message
      jest.useFakeTimers();
      handleCreateSnapshot(formFields, snapshots, setSnapshots);
      jest.runAllTimers();
      expect(mockMessageElement.parentNode.removeChild).toHaveBeenCalledWith(mockMessageElement);
      jest.useRealTimers();

      // Restore Date method
      Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
    });

    it('should add numbered snapshots based on existing count', () => {
      // Arrange
      const formFields = [{ id: 'field1', name: 'title', value: 'Test' }];
      const existingSnapshots = [
        { name: 'Snapshot 1 (10:00:00)', state: '{}', timestamp: '2023-01-01T10:00:00Z' },
        { name: 'Snapshot 2 (11:00:00)', state: '{}', timestamp: '2023-01-01T11:00:00Z' }
      ];
      const setSnapshots = jest.fn();

      // Mock Date methods
      const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
      Date.prototype.toLocaleTimeString = jest.fn().mockReturnValue('12:34:56');

      // Act
      handleCreateSnapshot(formFields, existingSnapshots, setSnapshots);

      // Assert
      const updateCallback = setSnapshots.mock.calls[0][0];
      const newSnapshots = updateCallback(existingSnapshots);

      // Should be Snapshot 3
      expect(newSnapshots).toHaveLength(3);
      expect(newSnapshots[2].name).toBe('Snapshot 3 (12:34:56)');

      // Restore Date method
      Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
    });
  });

  describe('handleRestoreSnapshot', () => {
    it('should not restore if index is out of bounds', () => {
      // Arrange
      const invalidIndex = 5;
      const snapshots = [{ name: 'Snapshot 1', state: '{}' }];
      const historyPosition = 0;
      const handleFormReset = jest.fn();
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();

      // Act
      handleRestoreSnapshot(
        invalidIndex,
        snapshots,
        historyPosition,
        handleFormReset,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );

      // Assert
      expect(handleFormReset).not.toHaveBeenCalled();
      expect(setHistory).not.toHaveBeenCalled();
    });

    it('should restore snapshot state and update history', () => {
      // Arrange
      const validIndex = 0;
      const snapshotState = { fields: [{ name: 'title', value: 'Snapshot Value' }] };
      const snapshots = [
        {
          name: 'Snapshot 1',
          state: JSON.stringify(snapshotState),
          timestamp: '2023-01-01T10:00:00Z'
        }
      ];
      const historyPosition = 1;
      const handleFormReset = jest.fn();
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();

      // Act
      handleRestoreSnapshot(
        validIndex,
        snapshots,
        historyPosition,
        handleFormReset,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );

      // Assert
      // Should parse and reset form with snapshot state
      expect(handleFormReset).toHaveBeenCalledWith(snapshotState);

      // Should update history with snapshot state
      expect(setHistory).toHaveBeenCalled();
      const historyCallback = setHistory.mock.calls[0][0];
      const updatedHistory = historyCallback(['state1', 'state2']);
      expect(updatedHistory).toEqual(['state1', 'state2', snapshots[0].state]);

      // Should increment position
      expect(setHistoryPosition).toHaveBeenCalled();
      const positionCallback = setHistoryPosition.mock.calls[0][0];
      expect(positionCallback(1)).toBe(2);

      // Should update redo level
      expect(setRedoLevel).toHaveBeenCalled();
    });

    it('should handle invalid JSON in snapshot state', () => {
      // Arrange
      const invalidSnapshot = {
        name: 'Invalid',
        state: 'not json',
        timestamp: '2023-01-01T10:00:00Z'
      };
      const snapshots = [invalidSnapshot];
      const historyPosition = 0;
      const handleFormReset = jest.fn();
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      handleRestoreSnapshot(
        0,
        snapshots,
        historyPosition,
        handleFormReset,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );

      // Assert
      expect(handleFormReset).not.toHaveBeenCalled();
      expect(setHistory).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should truncate history if not at the end', () => {
      // Arrange
      const validIndex = 0;
      const snapshotState = { fields: [{ name: 'title', value: 'Snapshot Value' }] };
      const snapshots = [
        {
          name: 'Snapshot 1',
          state: JSON.stringify(snapshotState),
          timestamp: '2023-01-01T10:00:00Z'
        }
      ];
      const historyPosition = 1; // Not at the end of a 3-item history
      const handleFormReset = jest.fn();
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();

      // Act
      handleRestoreSnapshot(
        validIndex,
        snapshots,
        historyPosition,
        handleFormReset,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );

      // Assert
      // Get the history update callback
      const historyCallback = setHistory.mock.calls[0][0];
      const updatedHistory = historyCallback(['state1', 'state2', 'state3']);

      // Should truncate at position + 1
      expect(updatedHistory).toEqual(['state1', 'state2', snapshots[0].state]);
    });
  });
});
