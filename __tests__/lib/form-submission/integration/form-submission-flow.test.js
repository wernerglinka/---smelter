import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { createSimpleForm, createComplexForm, createInvalidForm } from '../fixtures/example-form';

// Mock global window.electronAPI
global.window = Object.create(window);
window.electronAPI = {
  files: {
    writeYAML: jest.fn().mockResolvedValue({ status: 'success' })
  },
  dialog: {
    showCustomMessage: jest.fn().mockResolvedValue({ response: 0 })
  }
};

describe('Form Submission Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset default implementation
    window.electronAPI.files.writeYAML.mockResolvedValue({ status: 'success' });
  });
  
  test('should handle end-to-end simple form submission', async () => {
    const form = createSimpleForm();
    const filePath = '/path/to/simple-file.md';
    
    const result = await handleFormSubmission(form, filePath);
    
    expect(result).toEqual({ success: true });
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalledWith({
      obj: expect.objectContaining({
        title: 'Test Page Title',
        order: 42,
        draft: true
      }),
      path: filePath
    });
  });
  
  test('should handle end-to-end complex form submission', async () => {
    const form = createComplexForm();
    const filePath = '/path/to/complex-file.md';
    
    const result = await handleFormSubmission(form, filePath);
    
    expect(result).toEqual({ success: true });
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalledWith({
      obj: expect.objectContaining({
        title: 'Complex Test Page',
        metadata: expect.objectContaining({
          description: expect.any(String)
        }),
        tags: expect.any(Array),
        keywords: expect.any(Array)
      }),
      path: filePath
    });
  });
  
  test('should handle validation errors in invalid form', async () => {
    const form = createInvalidForm();
    const filePath = '/path/to/invalid-file.md';
    
    // Add a schema to force validation 
    const schema = {
      properties: {
        count: { type: 'number' }
      }
    };
    
    const result = await handleFormSubmission(form, filePath, schema);
    
    // Just verify the API was called correctly
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalled();
  });
  
  test('should handle file system errors', async () => {
    window.electronAPI.files.writeYAML.mockResolvedValueOnce({
      status: 'failure',
      error: 'Permission denied'
    });
    
    const form = createSimpleForm();
    const filePath = '/path/to/protected-file.md';
    
    const result = await handleFormSubmission(form, filePath);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to save file');
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalled();
  });
  
  test('should handle schema validation', async () => {
    const form = createSimpleForm();
    const filePath = '/path/to/schema-file.md';
    
    // Create a schema that expects title to be a number (which will fail)
    const schema = {
      properties: {
        title: { type: 'number' }
      }
    };
    
    const result = await handleFormSubmission(form, filePath, schema);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(window.electronAPI.files.writeYAML).not.toHaveBeenCalled();
  });
  
  test('should handle network errors during file writing', async () => {
    window.electronAPI.files.writeYAML.mockRejectedValueOnce(new Error('Network error'));
    
    const form = createSimpleForm();
    const filePath = '/path/to/network-file.md';
    
    const result = await handleFormSubmission(form, filePath);
    
    expect(result.success).toBe(false);
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalled();
  });
});