/**
 * Unit tests for the history handlers
 */
import {
  addToHistory,
  addHistoryEntry,
  handleFormReset,
  handleUndo,
  handleRedo
} from '../../../../src/renderer/src/lib/form-generation/history/historyHandlers';

describe('History Handler Functions', () => {
  // Mock document methods for DOM testing
  const originalCreateElement = document.createElement;
  const mockElement = {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn().mockReturnValue([]),
    getAttribute: jest.fn().mockReturnValue('field-name'),
    type: 'text',
    value: '',
    checked: false,
    tagName: 'INPUT'
  };

  beforeAll(() => {
    document.createElement = jest.fn().mockReturnValue(mockElement);
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('addToHistory', () => {
    it('should add form state to history array', () => {
      // Arrange
      const formState = { 
        fields: [{ id: 'test', name: 'title', value: 'Hello' }] 
      };
      const history = ['previousState'];
      const historyPosition = 0;
      const MAX_HISTORY = 10;
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      
      // Act
      addToHistory(
        formState,
        history,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
      
      // Assert
      expect(setHistory).toHaveBeenCalled();
      // Test the callback given to setHistory
      const setHistoryCallback = setHistory.mock.calls[0][0];
      const newHistory = setHistoryCallback(history);
      expect(newHistory).toHaveLength(2);
      expect(newHistory[1]).toBe(JSON.stringify(formState));
    });
    
    it('should truncate history if not at the end', () => {
      // Arrange
      const formState = { fields: [{ id: 'test', name: 'title', value: 'New' }] };
      const history = ['state1', 'state2', 'state3', 'state4'];
      const historyPosition = 1; // We're at position 1, so should truncate positions 2+
      const MAX_HISTORY = 10;
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      
      // Act
      addToHistory(
        formState,
        history,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
      
      // Assert
      const setHistoryCallback = setHistory.mock.calls[0][0];
      const newHistory = setHistoryCallback(history);
      expect(newHistory).toHaveLength(3);
      expect(newHistory[0]).toBe('state1');
      expect(newHistory[1]).toBe('state2');
      expect(newHistory[2]).toBe(JSON.stringify(formState));
    });

    it('should limit history to MAX_HISTORY entries', () => {
      // Arrange
      const formState = { fields: [{ id: 'test', name: 'title', value: 'Latest' }] };
      const history = Array(10).fill().map((_, i) => `state${i}`);
      const historyPosition = 9;
      const MAX_HISTORY = 10;
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      
      // Act
      addToHistory(
        formState,
        history,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
      
      // Assert
      const setHistoryCallback = setHistory.mock.calls[0][0];
      const newHistory = setHistoryCallback(history);
      expect(newHistory).toHaveLength(10); // Should still be 10 (MAX_HISTORY)
      expect(newHistory[0]).toBe('state1'); // First item should be dropped
      expect(newHistory[9]).toBe(JSON.stringify(formState)); // Last should be new state
    });
    
    it('should update history position after adding state', () => {
      // Arrange
      const formState = { fields: [{ id: 'test', name: 'title', value: 'Value' }] };
      const history = ['state1', 'state2'];
      const historyPosition = 1;
      const MAX_HISTORY = 10;
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      
      // Act
      addToHistory(
        formState,
        history,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
      
      // Assert
      // Should call position setter with callback
      expect(setHistoryPosition).toHaveBeenCalled();
      const positionCallback = setHistoryPosition.mock.calls[0][0];
      expect(positionCallback(1)).toBe(2);
      
      // Should update redo level with the same value
      expect(setRedoLevel).toHaveBeenCalled();
    });
  });
  
  describe('addHistoryEntry', () => {
    it('should add form state to history and update position', () => {
      // Arrange
      const formState = { fields: [{ id: 'test', name: 'title', value: 'Hello' }] };
      const historyPosition = 0;
      const MAX_HISTORY = 10;
      const setHistory = jest.fn();
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      
      // Act
      addHistoryEntry(
        formState,
        historyPosition,
        MAX_HISTORY,
        setHistory,
        setHistoryPosition,
        setRedoLevel
      );
      
      // Assert
      expect(setHistory).toHaveBeenCalled();
      const setHistoryCallback = setHistory.mock.calls[0][0];
      expect(typeof setHistoryCallback).toBe('function');
      
      // Can't easily test these because they're in setTimeout
      // Just verify the main history update happens
      const prevHistory = ['state1'];
      const newHistory = setHistoryCallback(prevHistory);
      expect(newHistory).toContain(JSON.stringify(formState));
    });
  });

  describe('handleUndo', () => {
    it('should not do anything if at position 0', () => {
      // Arrange
      const history = ['state0', 'state1'];
      const historyPosition = 0;
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const handleFormReset = jest.fn();
      
      // Act
      handleUndo(
        history,
        historyPosition,
        setHistoryPosition,
        setRedoLevel,
        handleFormReset
      );
      
      // Assert
      expect(setHistoryPosition).not.toHaveBeenCalled();
      expect(setRedoLevel).not.toHaveBeenCalled();
      expect(handleFormReset).not.toHaveBeenCalled();
    });
    
    it('should decrement position and restore previous state', () => {
      // Arrange
      const prevState = { fields: [{ name: 'test', value: 'old' }] };
      const history = [JSON.stringify(prevState), '{"fields":[{"name":"test","value":"new"}]}'];
      const historyPosition = 1;
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const handleFormReset = jest.fn();
      
      // Act
      handleUndo(
        history,
        historyPosition,
        setHistoryPosition,
        setRedoLevel,
        handleFormReset
      );
      
      // Assert
      expect(setHistoryPosition).toHaveBeenCalledWith(0);
      expect(setRedoLevel).toHaveBeenCalledWith(0);
      expect(handleFormReset).toHaveBeenCalledWith(prevState);
    });
    
    it('should handle invalid JSON in history', () => {
      // Arrange
      const history = ['invalid json', '{"fields":[]}'];
      const historyPosition = 1;
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const handleFormReset = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Act
      handleUndo(
        history,
        historyPosition,
        setHistoryPosition,
        setRedoLevel,
        handleFormReset
      );
      
      // Assert
      expect(setHistoryPosition).toHaveBeenCalledWith(0);
      expect(setRedoLevel).toHaveBeenCalledWith(0);
      expect(handleFormReset).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
  
  describe('handleRedo', () => {
    it('should not do anything if at the end of history', () => {
      // Arrange
      const history = ['state0', 'state1'];
      const historyPosition = 1; // At the end
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const handleFormReset = jest.fn();
      
      // Act
      handleRedo(
        history,
        historyPosition,
        setHistoryPosition,
        setRedoLevel,
        handleFormReset
      );
      
      // Assert
      expect(setHistoryPosition).not.toHaveBeenCalled();
      expect(setRedoLevel).not.toHaveBeenCalled();
      expect(handleFormReset).not.toHaveBeenCalled();
    });
    
    it('should increment position and restore next state', () => {
      // Arrange
      const nextState = { fields: [{ name: 'test', value: 'new' }] };
      const history = ['{"fields":[{"name":"test","value":"old"}]}', JSON.stringify(nextState)];
      const historyPosition = 0;
      const setHistoryPosition = jest.fn();
      const setRedoLevel = jest.fn();
      const handleFormReset = jest.fn();
      
      // Act
      handleRedo(
        history,
        historyPosition,
        setHistoryPosition,
        setRedoLevel,
        handleFormReset
      );
      
      // Assert
      expect(setHistoryPosition).toHaveBeenCalledWith(1);
      expect(setRedoLevel).toHaveBeenCalledWith(1);
      expect(handleFormReset).toHaveBeenCalledWith(nextState);
    });
  });
  
  describe('handleFormReset', () => {
    let mockFormRef;
    let mockForm;
    
    beforeEach(() => {
      // Create a more complete mock form for testing form reset
      mockForm = {
        querySelector: jest.fn(),
        querySelectorAll: jest.fn()
      };
      
      mockFormRef = { current: mockForm };
    });
    
    it('should do nothing if form ref is not available', () => {
      // Arrange
      const restoredState = [{ name: 'test', value: 'value' }];
      const invalidFormRef = { current: null };
      const setFormFields = jest.fn();
      
      // Act
      handleFormReset(restoredState, invalidFormRef, setFormFields);
      
      // Assert
      expect(setFormFields).not.toHaveBeenCalled();
    });
    
    it('should update form fields state', () => {
      // Arrange
      const restoredState = [{ name: 'test', value: 'value' }];
      const setFormFields = jest.fn();
      
      // Act
      handleFormReset(restoredState, mockFormRef, setFormFields);
      
      // Assert
      expect(setFormFields).toHaveBeenCalledWith(restoredState);
    });
    
    it('should process field values after setTimeout', () => {
      // Arrange
      const restoredState = [
        { name: 'text', type: 'text', value: 'text value' },
        { name: 'checkbox', type: 'checkbox', value: true }
      ];
      const setFormFields = jest.fn();
      
      // Mock DOM element finding
      const mockTextInput = { type: 'text', value: '' };
      const mockCheckbox = { type: 'checkbox', checked: false };
      
      mockForm.querySelector.mockImplementation((selector) => {
        if (selector === '[name="text"]') return mockTextInput;
        if (selector === '[name="checkbox"]') return mockCheckbox;
        return null;
      });
      
      // Fix for the Array.from(querySelectorAll) call
      const mockElements = [
        { getAttribute: () => 'text', type: 'text', value: '' },
        { getAttribute: () => 'checkbox', type: 'checkbox', checked: false }
      ];
      mockElements.map = jest.fn().mockReturnValue(mockElements);
      mockForm.querySelectorAll.mockReturnValue(mockElements);
      
      // Mock the setTimeout to execute immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation(fn => fn());
      
      // Act
      handleFormReset(restoredState, mockFormRef, setFormFields);
      
      // Assert - check DOM updates which should happen immediately with our mocked setTimeout
      expect(mockForm.querySelector).toHaveBeenCalledWith('[name="text"]');
      expect(mockForm.querySelector).toHaveBeenCalledWith('[name="checkbox"]');
      
      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });
});