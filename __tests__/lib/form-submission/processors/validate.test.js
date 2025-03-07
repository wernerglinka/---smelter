import { validateSubmission, isValidLabel } from '@lib/form-submission/validate';

describe('Form Validation', () => {
  describe('isValidLabel', () => {
    test('should validate alphanumeric labels', () => {
      expect(isValidLabel('validLabel')).toBe(true);
      expect(isValidLabel('valid123')).toBe(true);
      expect(isValidLabel('123valid')).toBe(true);
    });

    test('should reject invalid labels', () => {
      expect(isValidLabel('invalid-label')).toBe(false);
      expect(isValidLabel('invalid_label')).toBe(false);
      expect(isValidLabel('invalid label')).toBe(false);
      expect(isValidLabel('invalid!')).toBe(false);
    });
  });

  describe('validateSubmission', () => {
    test('should return empty array for valid form data', () => {
      const formData = {
        title: 'Test Page',
        count: 42,
        isActive: true,
        date: '2023-06-15T00:00:00.000Z'
      };

      const errors = validateSubmission(formData);
      expect(errors).toEqual([]);
    });

    test('should validate nested objects', () => {
      const formData = {
        title: 'Test Page',
        metadata: {
          description: 'Test description',
          count: 'not-a-number'
        }
      };

      // Create a schema that expects count to be a number
      const schema = {
        properties: {
          metadata: {
            properties: {
              count: {
                type: 'number'
              }
            }
          }
        }
      };

      const errors = validateSubmission(formData, schema);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('metadata.count');
    });

    test('should validate arrays of objects', () => {
      const formData = {
        title: 'Test Page',
        items: [
          { name: 'Item 1', value: 10 },
          { name: 'Item 2', value: 'not-a-number' }
        ]
      };

      // Create a schema that expects value to be a number
      const schema = {
        properties: {
          items: {
            type: 'array',
            items: {
              properties: {
                value: {
                  type: 'number'
                }
              }
            }
          }
        }
      };

      const errors = validateSubmission(formData, schema);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('items[1]');
    });

    test('should return error for null form data', () => {
      const errors = validateSubmission(null);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Missing form data');
    });

    test('should handle validation errors gracefully', () => {
      // Mock console.error to prevent test output pollution
      const originalConsoleError = console.error;
      console.error = jest.fn();

      // Create malformed data that would cause an error
      const formData = {
        test: {
          get type() {
            throw new Error('Test error');
          }
        }
      };

      const errors = validateSubmission(formData);

      expect(errors).toHaveLength(1);
      // The error message varies based on implementation details
      expect(errors[0]).toMatch(/Invalid form structure/);
      expect(console.error).toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });

    test('should validate different data types correctly', () => {
      // Test number validation
      expect(
        validateSubmission({ count: 'not-a-number' }, { properties: { count: { type: 'number' } } })
      ).toHaveLength(1);
      expect(
        validateSubmission({ count: 42 }, { properties: { count: { type: 'number' } } })
      ).toHaveLength(0);

      // Test boolean validation
      expect(
        validateSubmission({ isActive: 'maybe' }, { properties: { isActive: { type: 'boolean' } } })
      ).toHaveLength(1);
      expect(
        validateSubmission({ isActive: true }, { properties: { isActive: { type: 'boolean' } } })
      ).toHaveLength(0);

      // Test date validation
      expect(
        validateSubmission({ date: 'not-a-date' }, { properties: { date: { type: 'date' } } })
      ).toHaveLength(1);
      expect(
        validateSubmission(
          { date: '2023-06-15T00:00:00.000Z' },
          { properties: { date: { type: 'date' } } }
        )
      ).toHaveLength(0);

      // Test array validation
      expect(
        validateSubmission({ items: 'not-an-array' }, { properties: { items: { type: 'array' } } })
      ).toHaveLength(1);
      expect(
        validateSubmission({ items: [] }, { properties: { items: { type: 'array' } } })
      ).toHaveLength(0);
    });
  });
});
