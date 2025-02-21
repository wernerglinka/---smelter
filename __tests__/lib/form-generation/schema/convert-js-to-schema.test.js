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

  describe('convertToSchemaObject', () => {
    test('converts simple object to schema', async () => {
      const json = {
        title: 'Hello',
        count: 42,
        isPublished: true
      };

      const result = await convertToSchemaObject(json);

      expect(result).toEqual({
        fields: [
          {
            label: 'title',
            name: 'title',
            type: 'text',
            value: 'Hello',
            placeholder: 'Add title',
            isExplicit: false
          },
          {
            label: 'count',
            name: 'count',
            type: 'number',
            value: 42,
            placeholder: 'Add count',
            isExplicit: false
          },
          {
            label: 'isPublished',
            name: 'isPublished',
            type: 'checkbox',
            value: true,
            placeholder: 'Add isPublished',
            isExplicit: false
          }
        ]
      });
    });

    test('uses schema to override inferred types', async () => {
      const json = {
        count: 42
      };
      const schema = [
        {
          name: 'count',
          type: 'range',
          min: 0,
          max: 100
        }
      ];

      const result = await convertToSchemaObject(json, schema);

      expect(result.fields[0]).toMatchObject({
        name: 'count',
        type: 'range',
        value: 42,
        min: 0,
        max: 100,
        isExplicit: true
      });
    });

    test('handles nested objects', async () => {
      const json = {
        seo: {
          title: 'Page Title',
          description: 'Page Description'
        }
      };

      const result = await convertToSchemaObject(json);

      expect(result.fields[0]).toMatchObject({
        name: 'seo',
        type: 'object',
        fields: [
          {
            name: 'title',
            type: 'text',
            value: 'Page Title',
            placeholder: 'Add title',
            isExplicit: false
          },
          {
            name: 'description',
            type: 'text',
            value: 'Page Description',
            placeholder: 'Add description',
            isExplicit: false
          }
        ]
      });
    });

    test('handles arrays of primitives when isSimpleList is true', async () => {
      isSimpleList.mockReturnValue(true);

      const json = {
        tags: ['javascript', 'testing', 'jest']
      };

      const result = await convertToSchemaObject(json);

      expect(result.fields[0]).toMatchObject({
        name: 'tags',
        type: 'list',
        value: ['javascript', 'testing', 'jest'],
        isExplicit: false
      });
    });

    test('handles arrays of objects', async () => {
      const json = {
        sections: [
          {
            title: 'Section 1',
            content: 'Content 1'
          },
          {
            title: 'Section 2',
            content: 'Content 2'
          }
        ]
      };

      const result = await convertToSchemaObject(json);

      expect(result.fields[0]).toMatchObject({
        name: 'sections',
        type: 'array',
        value: [
          {
            type: 'object',
            label: 'Item 1',
            fields: [
              {
                name: 'title',
                type: 'text',
                value: 'Section 1'
              },
              {
                name: 'content',
                type: 'text',
                value: 'Content 1'
              }
            ]
          },
          {
            type: 'object',
            label: 'Item 2',
            fields: [
              {
                name: 'title',
                type: 'text',
                value: 'Section 2'
              },
              {
                name: 'content',
                type: 'text',
                value: 'Content 2'
              }
            ]
          }
        ]
      });
    });

    test('handles null and undefined values', async () => {
      const json = {
        title: null,
        description: undefined,
        meta: {
          author: null,
          tags: []
        }
      };

      const result = await convertToSchemaObject(json);

      expect(result.fields).toEqual([
        {
          label: 'title',
          name: 'title',
          type: 'text',
          value: null,
          placeholder: 'Add title',
          isExplicit: false
        },
        {
          label: 'description',
          name: 'description',
          type: 'text',
          value: undefined,
          placeholder: 'Add description',
          isExplicit: false
        },
        {
          label: 'meta',
          name: 'meta',
          type: 'object',
          value: {
            author: null,
            tags: []
          },
          placeholder: 'Add meta',
          isExplicit: false,
          isRequired: false,
          noDeletion: false,
          noDuplication: true,
          fields: [
            {
              label: 'author',
              name: 'author',
              type: 'text',
              value: null,
              placeholder: 'Add author',
              isExplicit: false
            },
            {
              label: 'tags',
              name: 'tags',
              type: 'array',
              value: [],
              placeholder: 'Add tags',
              isExplicit: false,
              isRequired: false,
              noDeletion: false,
              noDuplication: true
            }
          ]
        }
      ]);
    });
  });
});
