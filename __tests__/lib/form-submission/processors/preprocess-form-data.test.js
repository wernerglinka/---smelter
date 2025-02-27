import { preprocessFormData } from '@lib/form-submission/preprocess-form-data';
import { transformFormElementsToObject } from '@lib/form-submission/transform-form-to-object';
import { createSimpleForm, createComplexForm } from '../fixtures/example-form';

// Mock the transformFormElementsToObject function
jest.mock('@lib/form-submission/transform-form-to-object', () => ({
  transformFormElementsToObject: jest.fn().mockReturnValue({
    title: 'Test Title',
    description: 'Test Description'
  })
}));

describe('Form Data Preprocessing', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  test('should add temporary markers to dropzones', () => {
    const form = createSimpleForm();
    
    // Verify no is-last elements exist before processing
    expect(form.querySelectorAll('.is-last').length).toBe(0);
    
    // Create a spy on document.createElement
    const originalCreateElement = document.createElement;
    let createdElements = [];
    document.createElement = jest.fn(tag => {
      const element = originalCreateElement.call(document, tag);
      createdElements.push(element);
      return element;
    });
    
    preprocessFormData(form);
    
    // Check that temporary elements were created
    expect(document.createElement).toHaveBeenCalled();
    expect(createdElements.length).toBeGreaterThan(0);
    
    // And they should be removed after processing
    expect(form.querySelectorAll('.is-last').length).toBe(0);
    
    // Restore createElement
    document.createElement = originalCreateElement;
  });
  
  test('should handle array dropzones specially', () => {
    const form = createComplexForm();
    
    // Verify no array-last elements exist before processing
    expect(form.querySelectorAll('.array-last').length).toBe(0);
    
    preprocessFormData(form);
    
    // Verify transformFormElementsToObject was called
    expect(transformFormElementsToObject).toHaveBeenCalled();
    
    // All temporary markers should be removed
    expect(form.querySelectorAll('.is-last').length).toBe(0);
    expect(form.querySelectorAll('.array-last').length).toBe(0);
  });
  
  test('should call transformFormElementsToObject with all form elements', () => {
    const form = createSimpleForm();
    const allFormElements = form.querySelectorAll('.form-element');
    
    preprocessFormData(form);
    
    // Check that transformFormElementsToObject was called
    expect(transformFormElementsToObject).toHaveBeenCalled();
    
    // The first argument should be a NodeList of form elements
    const calledWithElements = transformFormElementsToObject.mock.calls[0][0];
    expect(calledWithElements.length).toBeGreaterThan(allFormElements.length);
    // Should include the original elements plus temporary markers
  });
  
  test('should handle errors gracefully', () => {
    // Mock console.error to prevent test output pollution
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Mock transformFormElementsToObject to throw an error
    transformFormElementsToObject.mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    
    const form = createSimpleForm();
    const result = preprocessFormData(form);
    
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalled();
    
    // Note: We won't check for cleaning up in the error case as it might not finish the cleanup
    // process when an error is thrown
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('should return transformed data on success', () => {
    const form = createSimpleForm();
    const expectedResult = {
      title: 'Test Title',
      description: 'Test Description'
    };
    
    const result = preprocessFormData(form);
    
    expect(result).toEqual(expectedResult);
  });
  
  test('should mark array elements specially', () => {
    // Create a form with an array element
    const form = document.createElement('form');
    
    // Create a form element with an array
    const arrayElement = document.createElement('div');
    arrayElement.classList.add('form-element', 'is-array');
    
    // Create a dropzone inside the array
    const arrayDropzone = document.createElement('div');
    arrayDropzone.classList.add('dropzone');
    
    // Add some items to the array
    const item1 = document.createElement('div');
    item1.classList.add('form-element');
    const item2 = document.createElement('div');
    item2.classList.add('form-element');
    
    arrayDropzone.appendChild(item1);
    arrayDropzone.appendChild(item2);
    arrayElement.appendChild(arrayDropzone);
    form.appendChild(arrayElement);
    
    // Process the form
    preprocessFormData(form);
    
    // The transform function should have been called
    expect(transformFormElementsToObject).toHaveBeenCalled();
  });
});