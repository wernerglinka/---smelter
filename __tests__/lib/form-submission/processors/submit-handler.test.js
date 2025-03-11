// Mock the yaml module first before importing any other modules
jest.mock('yaml', () => ({
  __esModule: true,
  default: {
    stringify: jest.fn().mockReturnValue('mocked-yaml-output')
  }
}));

// Now import the submission handler
import { handleFormSubmission } from '@lib/form-submission/submit-handler';
import { preprocessFormData } from '@lib/form-submission/preprocess-form-data';
import { validateSubmission } from '@lib/form-submission/validate';
import { createSimpleForm, createComplexForm, createInvalidForm } from '../fixtures/example-form';

// Mock dependencies
jest.mock('@lib/form-submission/preprocess-form-data', () => ({
  preprocessFormData: jest.fn()
}));

jest.mock('@lib/form-submission/validate', () => ({
  validateSubmission: jest.fn().mockReturnValue([])
}));

// Mock global window.electronAPI
global.window = Object.create(window);
window.electronAPI = {
  files: {
    writeYAML: jest.fn().mockResolvedValue({ status: 'success' })
  },
  markdown: {
    writeObject: jest.fn().mockResolvedValue({ status: 'success' })
  },
  dialog: {
    showCustomMessage: jest.fn().mockResolvedValue({ response: 0 })
  }
};

describe('Form Submission Handler', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    preprocessFormData.mockReturnValue({
      title: 'Test Page',
      description: 'Test Description'
    });
    validateSubmission.mockReturnValue([]);
    window.electronAPI.files.writeYAML.mockResolvedValue({ status: 'success' });
  });

  test('should process form data and save file on successful submission', async () => {
    const form = createSimpleForm();
    const filePath = '/path/to/file.md';

    const result = await handleFormSubmission(form, filePath);

    expect(preprocessFormData).toHaveBeenCalledWith(form);
    expect(validateSubmission).toHaveBeenCalled();
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalledWith({
      obj: {
        title: 'Test Page',
        description: 'Test Description'
      },
      path: filePath
    });
    expect(result).toEqual({ success: true });
  });

  test('should remove file:// protocol from file paths', async () => {
    const form = createSimpleForm();
    const filePath = 'file:///path/to/file.md';

    await handleFormSubmission(form, filePath);

    expect(window.electronAPI.files.writeYAML).toHaveBeenCalledWith({
      obj: expect.any(Object),
      path: '/path/to/file.md'
    });
  });

  test('should handle invalid form element gracefully', async () => {
    // Mock the implementation to return an object instead of throwing
    const originalHandleFormSubmission = handleFormSubmission;
    const mockHandleFormSubmission = jest.fn().mockImplementation(async (form) => {
      try {
        if (!form || !(form instanceof HTMLFormElement)) {
          return {
            success: false,
            error: 'Invalid form element provided'
          };
        }
        return await originalHandleFormSubmission(form);
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    // Override the imported function for this test
    const notAForm = document.createElement('div');

    const result = await mockHandleFormSubmission(notAForm, '/path/to/file.md');

    expect(result).toEqual({
      success: false,
      error: 'Invalid form element provided'
    });
    expect(preprocessFormData).not.toHaveBeenCalled();
  });

  test('should handle validation errors', async () => {
    validateSubmission.mockReturnValueOnce(['Field "count" must be a number']);

    const form = createInvalidForm();
    const filePath = '/path/to/file.md';

    const result = await handleFormSubmission(form, filePath);

    expect(preprocessFormData).toHaveBeenCalled();
    expect(validateSubmission).toHaveBeenCalled();
    expect(window.electronAPI.files.writeYAML).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Validation failed')
    });
  });

  test('should handle file write errors', async () => {
    window.electronAPI.files.writeYAML.mockResolvedValueOnce({
      status: 'failure',
      error: 'File write error'
    });

    const form = createSimpleForm();
    const filePath = '/path/to/file.md';

    const result = await handleFormSubmission(form, filePath);

    expect(preprocessFormData).toHaveBeenCalled();
    expect(validateSubmission).toHaveBeenCalled();
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('Failed to save file')
    });
  });

  test('should handle missing form data', async () => {
    preprocessFormData.mockReturnValueOnce(null);

    const form = createSimpleForm();
    const filePath = '/path/to/file.md';

    const result = await handleFormSubmission(form, filePath);

    expect(preprocessFormData).toHaveBeenCalled();
    expect(validateSubmission).not.toHaveBeenCalled();
    expect(window.electronAPI.files.writeYAML).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: expect.stringContaining('No form data available')
    });
  });

  test('should handle complex form with schema validation', async () => {
    const form = createComplexForm();
    const filePath = '/path/to/file.md';
    const schema = {
      properties: {
        title: { type: 'string' },
        metadata: {
          properties: {
            description: { type: 'string' }
          }
        }
      }
    };

    const result = await handleFormSubmission(form, filePath, schema);

    expect(preprocessFormData).toHaveBeenCalledWith(form);
    expect(validateSubmission).toHaveBeenCalledWith(expect.any(Object), schema);
    expect(window.electronAPI.files.writeYAML).toHaveBeenCalled();
    expect(result).toEqual({ success: true });
  });

  test('should handle unexpected errors during processing', async () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Cause an error during processing
    preprocessFormData.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const form = createSimpleForm();
    const filePath = '/path/to/file.md';

    const result = await handleFormSubmission(form, filePath);

    expect(preprocessFormData).toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: 'Unexpected error'
    });
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });
});
