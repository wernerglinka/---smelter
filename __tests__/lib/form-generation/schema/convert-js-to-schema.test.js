import { convertToSchemaObject } from '@lib/form-generation/schema/convert-js-to-schema';
import { isSimpleList, isDateObject } from '@lib/utilities/validation/type-validators';

// Mock the validation utilities
jest.mock('@lib/utilities/validation/type-validators', () => ({
  isSimpleList: jest.fn(),
  isDateObject: jest.fn()
}));

describe('convert-js-to-schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isSimpleList.mockReturnValue(false);
    isDateObject.mockReturnValue(false);
  });

  describe('inferType', () => {
    test('infers list type correctly', () => {
      isSimpleList.mockReturnValue(true);
      const result = convertToSchemaObject({ tags: ['a', 'b', 'c'] });
      expect(result.fields[0].type).toBe('list');
    });

    test('infers date type correctly', () => {
      isDateObject.mockReturnValue(true);
      const result = convertToSchemaObject({ publishDate: new Date() });
      expect(result.fields[0].type).toBe('date');
    });

    test('infers array type correctly', () => {
      const result = convertToSchemaObject({ items: [{ id: 1 }, { id: 2 }] });
      expect(result.fields[0].type).toBe('array');
    });

    test('infers textarea for multiline strings', () => {
      const result = convertToSchemaObject({ content: 'line1\nline2' });
      expect(result.fields[0].type).toBe('textarea');
    });

    test('infers text for single line strings', () => {
      const result = convertToSchemaObject({ title: 'Hello' });
      expect(result.fields[0].type).toBe('text');
    });

    test('infers object type correctly', () => {
      const result = convertToSchemaObject({ meta: { title: 'Test' } });
      expect(result.fields[0].type).toBe('object');
    });

    test('infers checkbox for booleans', () => {
      const result = convertToSchemaObject({ isPublished: true });
      expect(result.fields[0].type).toBe('checkbox');
    });

    test('infers number type correctly', () => {
      const result = convertToSchemaObject({ count: 42 });
      expect(result.fields[0].type).toBe('number');
    });
  });

  describe('schema matching', () => {
    test('uses explicit schema type over inferred type', async () => {
      const schema = [{ name: 'count', type: 'range' }];
      const result = await convertToSchemaObject({ count: 42 }, schema);
      expect(result.fields[0].type).toBe('range');
    });

    test('preserves additional schema properties', async () => {
      const schema = [{
        name: 'tags',
        type: 'list',
        options: ['a', 'b', 'c'],
        required: true
      }];
      const result = await convertToSchemaObject({ tags: ['a'] }, schema);
      expect(result.fields[0]).toMatchObject({
        options: ['a', 'b', 'c'],
        required: true
      });
    });
  });

  describe('complex structures', () => {
    test('handles nested objects', async () => {
      const data = {
        meta: {
          title: 'Test',
          seo: {
            description: 'Test description'
          }
        }
      };
      const result = await convertToSchemaObject(data);
      expect(result.fields[0].type).toBe('object');
      expect(result.fields[0].fields[0].type).toBe('text');
      expect(result.fields[0].fields[1].type).toBe('object');
    });

    test('handles arrays of objects', async () => {
      const data = {
        sections: [{
          title: 'Section 1',
          content: 'Content 1'
        }]
      };
      const result = await convertToSchemaObject(data);
      expect(result.fields[0].type).toBe('array');
      expect(result.fields[0].value[0].type).toBe('object');
    });

    test('handles mixed content arrays', async () => {
      const data = {
        mixed: ['string', 42, { key: 'value' }]
      };
      const result = await convertToSchemaObject(data);
      expect(result.fields[0].type).toBe('array');
      expect(result.fields[0].value).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    test('handles null values', async () => {
      const result = await convertToSchemaObject({ nullField: null });
      expect(result.fields[0].type).toBe('text');
    });

    test('handles undefined values', async () => {
      const result = await convertToSchemaObject({ undefinedField: undefined });
      expect(result.fields[0].type).toBe('text');
    });

    test('handles empty objects', async () => {
      const result = await convertToSchemaObject({});
      expect(result.fields).toHaveLength(0);
    });

    test('handles circular references', async () => {
      const circular = { name: 'test' };
      circular.self = circular;
      await expect(convertToSchemaObject(circular))
        .rejects.toThrow(/circular/i);
    });
  });
});