/**
 * Unit tests for field handlers in EditSpace
 */
import {
  handleFieldUpdate,
  handleFieldDuplicate,
  handleFieldDelete
} from '@lib/form-generation/handlers/fieldHandlers';

describe('Field Handler Functions', () => {
  // Mock DOM methods for UI notifications
  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const mockElement = {
    className: '',
    textContent: '',
    parentNode: {
      removeChild: jest.fn()
    }
  };

  beforeAll(() => {
    document.createElement = jest.fn().mockReturnValue(mockElement);
    document.body.appendChild = jest.fn();
  });

  afterAll(() => {
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleFieldUpdate', () => {
    it('should update a top-level field value', () => {
      // Arrange
      const updatedField = { id: 'field1', name: 'title', type: 'text', value: 'New Value' };
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();
      const initialFields = [
        { id: 'field1', name: 'title', type: 'text', value: 'Old Value' },
        { id: 'field2', name: 'description', type: 'textarea', value: 'Description' }
      ];

      // Mock setTimeout to execute callbacks immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation((fn) => fn());

      // Act
      handleFieldUpdate(updatedField, [], setFormFields, addHistoryEntry);

      // Assert
      expect(setFormFields).toHaveBeenCalled();
      const callback = setFormFields.mock.calls[0][0];
      const result = callback(initialFields);

      // Check field was updated
      expect(result[0].value).toBe('New Value');
      expect(result[1].value).toBe('Description'); // Other field unchanged

      // With mocked setTimeout, addHistoryEntry should be called immediately
      expect(addHistoryEntry).toHaveBeenCalled();

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should handle field updates with nested paths', () => {
      // Arrange
      const updatedField = { id: 'nested1', name: 'nested', type: 'text', value: 'Updated Nested' };
      const fieldPath = [
        { type: 'object', index: 0 }, // Parent object at index 0
        { type: 'field', index: 1, fieldIndex: 0 } // Child field at index 1
      ];
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();

      const initialFields = [
        {
          id: 'parent1',
          name: 'parent',
          type: 'object',
          fields: [
            { id: 'child1', name: 'child', type: 'text', value: 'Child Value' },
            { id: 'nested1', name: 'nested', type: 'text', value: 'Old Nested' }
          ]
        }
      ];

      // Mock JSON functions for deep copy
      const originalStringify = JSON.stringify;
      const originalParse = JSON.parse;
      JSON.stringify = jest.fn().mockReturnValue('{"mocked":"json"}');
      JSON.parse = jest.fn().mockReturnValue(JSON.parse(originalStringify(initialFields)));

      // Act
      handleFieldUpdate(updatedField, fieldPath, setFormFields, addHistoryEntry);

      // Assert
      expect(setFormFields).toHaveBeenCalled();

      // Restore original JSON functions
      JSON.stringify = originalStringify;
      JSON.parse = originalParse;
    });

    it('should handle missing field ID and name', () => {
      // Arrange
      const invalidField = { type: 'text', value: 'New Value' }; // No ID or name
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      handleFieldUpdate(invalidField, [], setFormFields, addHistoryEntry);

      // Assert
      const callback = setFormFields.mock.calls[0][0];
      const initialFields = [{ id: 'field1', name: 'title', value: 'Old Value' }];
      const result = callback(initialFields);

      // Should return unchanged fields
      expect(result).toEqual(initialFields);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleFieldDuplicate', () => {
    it('should prevent duplication of special fields', () => {
      // Arrange
      const contentsField = {
        id: 'markdown-contents',
        name: 'contents',
        type: 'textarea',
        noDuplication: true
      };
      const index = 0;
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();

      // Act
      const result = handleFieldDuplicate(contentsField, index, setFormFields, addHistoryEntry);

      // Assert
      expect(result).toBe(false);
      expect(setFormFields).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.className).toContain('error');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should duplicate a field and add to form fields', () => {
      // Arrange
      const fieldToDuplicate = {
        id: 'field1',
        name: 'title',
        type: 'text',
        value: 'Original',
        label: 'Title'
      };
      const index = 1;
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();

      // Mock Date.now for consistent testing
      const originalDateNow = Date.now;
      Date.now = jest.fn().mockReturnValue(12345);

      // Mock Math.random for consistent testing
      const originalRandom = Math.random;
      Math.random = jest.fn().mockReturnValue(0.5);

      // Act
      const result = handleFieldDuplicate(fieldToDuplicate, index, setFormFields, addHistoryEntry);

      // Assert
      expect(result).toBe(true);
      expect(setFormFields).toHaveBeenCalled();

      const callback = setFormFields.mock.calls[0][0];
      const initialFields = [
        { id: 'field0', name: 'description', value: 'Desc' },
        { id: 'field1', name: 'title', value: 'Original', label: 'Title' }
      ];
      const updatedFields = callback(initialFields);

      // Should add duplicate after the original (index 1)
      expect(updatedFields.length).toBe(3);
      expect(updatedFields[2].id).toContain('field1_copy');
      expect(updatedFields[2].name).toContain('title_copy');
      expect(updatedFields[2].value).toBe('Original');
      expect(updatedFields[2].label).toBe(''); // Empty for editing
      expect(updatedFields[2]._displayLabel).toContain('Title (Copy)');

      // Restore mocked functions
      Date.now = originalDateNow;
      Math.random = originalRandom;
    });

    it('should handle invalid index for duplication', () => {
      // Arrange
      const fieldToDuplicate = { id: 'field1', name: 'title', value: 'Original' };
      const invalidIndex = 999; // Out of bounds
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      handleFieldDuplicate(fieldToDuplicate, invalidIndex, setFormFields, addHistoryEntry);

      // Assert
      expect(setFormFields).toHaveBeenCalled();
      const callback = setFormFields.mock.calls[0][0];
      const initialFields = [{ id: 'field1', name: 'title', value: 'Original' }];
      const result = callback(initialFields);

      // Should return unchanged fields due to invalid index
      expect(result).toEqual(initialFields);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('handleFieldDelete', () => {
    it('should prevent deletion of protected fields', () => {
      // Arrange
      const contentsField = {
        id: 'markdown-contents',
        name: 'contents',
        type: 'textarea',
        noDeletion: true
      };
      const index = 0;
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();

      // Act
      const result = handleFieldDelete(contentsField, index, setFormFields, addHistoryEntry);

      // Assert
      expect(result).toBe(false);
      expect(setFormFields).not.toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(mockElement.className).toContain('error');
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it('should delete a field at the specified index', () => {
      // Arrange
      const fieldToDelete = { id: 'field1', name: 'title', value: 'Delete Me' };
      const index = 1;
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();

      // Mock setTimeout to execute callbacks immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = jest.fn().mockImplementation((fn) => fn());

      // Act
      const result = handleFieldDelete(fieldToDelete, index, setFormFields, addHistoryEntry);

      // Assert
      expect(result).toBe(true);
      expect(setFormFields).toHaveBeenCalled();

      const callback = setFormFields.mock.calls[0][0];
      const initialFields = [
        { id: 'field0', name: 'description', value: 'Keep' },
        { id: 'field1', name: 'title', value: 'Delete Me' },
        { id: 'field2', name: 'notes', value: 'Keep Too' }
      ];
      const updatedFields = callback(initialFields);

      // Should remove the field at index 1
      expect(updatedFields.length).toBe(2);
      expect(updatedFields[0].id).toBe('field0');
      expect(updatedFields[1].id).toBe('field2');

      // With mocked setTimeout, addHistoryEntry should be called immediately
      expect(addHistoryEntry).toHaveBeenCalled();

      // Restore original setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should handle invalid index for deletion', () => {
      // Arrange
      const fieldToDelete = { id: 'field1', name: 'title', value: 'Delete Me' };
      const invalidIndex = 999; // Out of bounds
      const setFormFields = jest.fn();
      const addHistoryEntry = jest.fn();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      handleFieldDelete(fieldToDelete, invalidIndex, setFormFields, addHistoryEntry);

      // Assert
      expect(setFormFields).toHaveBeenCalled();
      const callback = setFormFields.mock.calls[0][0];
      const initialFields = [{ id: 'field1', name: 'title', value: 'Delete Me' }];
      const result = callback(initialFields);

      // Should return unchanged fields due to invalid index
      expect(result).toEqual(initialFields);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
