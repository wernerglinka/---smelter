/**
 * Note: This test now tests the compat layer (which just imports from the new location).
 * Detailed functionality testing happens in the new utils/transform tests.
 */
import { preprocessFormData } from '@lib/form-submission/preprocess-form-data';
import { createSimpleForm } from '../fixtures/example-form';

// Mock the new implementation
jest.mock('@utils/transform/form-to-object', () => ({
  preprocessFormData: jest.fn().mockReturnValue({
    title: 'Test Title',
    description: 'Test Description'
  })
}));

describe('Form Data Preprocessing - compatibility layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call the utility from the new location', () => {
    const form = createSimpleForm();
    
    // Get the mocked function from the new location
    const mockFn = require('@utils/transform/form-to-object').preprocessFormData;
    
    // Make sure it hasn't been called yet
    expect(mockFn).not.toHaveBeenCalled();
    
    // Call through the compatibility layer
    const result = preprocessFormData(form);
    
    // Verify it called the new implementation
    expect(mockFn).toHaveBeenCalledWith(form);
    expect(result).toEqual({
      title: 'Test Title',
      description: 'Test Description'
    });
  });
});
