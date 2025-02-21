import {
  convertToSchemaObject,
  __test__
} from '../../../../src/renderer/src/lib/form-generation/schema/convert-js-to-schema';
const { matchSchemaField, createField } = __test__;

describe('convertToSchemaObject input validation', () => {
  it('handles null json input', async () => {
    const result = await convertToSchemaObject(null);
    expect(result).toEqual({ fields: [] });
  });

  it('handles undefined json input', async () => {
    const result = await convertToSchemaObject(undefined);
    expect(result).toEqual({ fields: [] });
  });

  it('handles non-object json inputs', async () => {
    const testCases = ['string', 123, true, [1, 2, 3], () => {}, Symbol('test')];

    for (const input of testCases) {
      const result = await convertToSchemaObject(input);
      expect(result).toEqual({ fields: [] });
    }
  });

  it('handles empty json object', async () => {
    const result = await convertToSchemaObject({});
    expect(result).toEqual({ fields: [] });
  });
});

describe('convertToSchemaObject edge cases', () => {
  it('handles json with null values', async () => {
    const json = {
      field1: null
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: null,
      isExplicit: false
    });
  });

  it('handles json with undefined values', async () => {
    const json = {
      field1: undefined
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: undefined,
      isExplicit: false
    });
  });
});

describe('convertToSchemaObject schema handling', () => {
  it('handles invalid schema input', async () => {
    const json = { key: 'value' };
    const invalidSchema = 'not-an-array';

    const result = await convertToSchemaObject(json, invalidSchema);
    expect(result.fields[0]).toMatchObject({
      name: 'key',
      value: 'value',
      isExplicit: false
    });
  });

  it('handles undefined schema', async () => {
    const json = { key: 'value' };

    const result = await convertToSchemaObject(json, undefined);
    expect(result.fields[0]).toMatchObject({
      name: 'key',
      value: 'value',
      isExplicit: false
    });
  });

  it('handles array type schema without fields property', async () => {
    const json = {
      testArray: ['item1', 'item2']
    };
    const schema = [
      {
        name: 'testArray',
        type: 'array'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'testArray',
      type: 'array',
      value: ['item1', 'item2'],
      isExplicit: true
    });
  });

  it('handles object type schema without fields property', async () => {
    const json = {
      testObject: {
        nestedKey: 'value'
      }
    };
    const schema = [
      {
        name: 'testObject',
        type: 'object'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'testObject',
      type: 'object',
      value: { nestedKey: 'value' },
      isExplicit: true,
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: 'nestedKey',
          value: 'value',
          isExplicit: false
        })
      ])
    });
  });
});

describe('convertToSchemaObject', () => {
  it('converts simple JSON object without schema', async () => {
    const json = {
      title: 'Test Page',
      published: true,
      order: 1
    };

    const result = await convertToSchemaObject(json);
    expect(result).toEqual({
      fields: [
        {
          label: 'title',
          name: 'title',
          type: 'text',
          value: 'Test Page',
          placeholder: 'Add title',
          isExplicit: false
        },
        {
          label: 'published',
          name: 'published',
          type: 'checkbox',
          value: true,
          placeholder: 'Add published',
          isExplicit: false
        },
        {
          label: 'order',
          name: 'order',
          type: 'number',
          value: 1,
          placeholder: 'Add order',
          isExplicit: false
        }
      ]
    });
  });

  it('converts object with explicit schema', async () => {
    const json = {
      title: 'Test Page'
    };
    const schema = [
      {
        name: 'title',
        type: 'textarea',
        required: true,
        description: 'Page title'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toEqual({
      label: 'title',
      name: 'title',
      type: 'textarea',
      value: 'Test Page',
      placeholder: 'Add title',
      required: true,
      description: 'Page title',
      isExplicit: true
    });
  });

  it('handles nested objects', async () => {
    const json = {
      meta: {
        author: 'John Doe',
        tags: ['test', 'example']
      }
    };

    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toEqual({
      label: 'meta',
      name: 'meta',
      type: 'object',
      value: {
        author: 'John Doe',
        tags: ['test', 'example']
      },
      fields: [
        {
          label: 'author',
          name: 'author',
          type: 'text',
          value: 'John Doe',
          placeholder: 'Add author',
          isExplicit: false
        },
        {
          label: 'tags',
          name: 'tags',
          type: 'list',
          value: ['test', 'example'],
          placeholder: 'Add tags',
          isExplicit: false
        }
      ],
      placeholder: 'Add meta',
      isExplicit: false,
      noDeletion: false,
      isRequired: false,
      noDuplication: true
    });
  });

  it('handles arrays of objects', async () => {
    const json = {
      sections: [
        { title: 'Section 1', content: 'Content 1' },
        { title: 'Section 2', content: 'Content 2' }
      ]
    };

    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toEqual({
      label: 'sections',
      name: 'sections',
      type: 'array',
      value: [
        {
          type: 'object',
          label: 'Item 1',
          id: 'undefined_0',
          value: { title: 'Section 1', content: 'Content 1' },
          fields: [
            {
              label: 'title',
              name: 'title',
              type: 'date',
              value: 'Section 1',
              placeholder: 'Add title',
              isExplicit: false
            },
            {
              label: 'content',
              name: 'content',
              type: 'date',
              value: 'Content 1',
              placeholder: 'Add content',
              isExplicit: false
            }
          ]
        },
        {
          type: 'object',
          label: 'Item 2',
          id: 'undefined_1',
          value: { title: 'Section 2', content: 'Content 2' },
          fields: [
            {
              label: 'title',
              name: 'title',
              type: 'date',
              value: 'Section 2',
              placeholder: 'Add title',
              isExplicit: false
            },
            {
              label: 'content',
              name: 'content',
              type: 'date',
              value: 'Content 2',
              placeholder: 'Add content',
              isExplicit: false
            }
          ]
        }
      ],
      placeholder: 'Add sections',
      isExplicit: false,
      noDeletion: false,
      isRequired: false,
      noDuplication: true
    });
  });

  it('handles empty objects', async () => {
    const json = {};
    const result = await convertToSchemaObject(json);
    expect(result).toEqual({ fields: [] });
  });

  it('handles null values', async () => {
    const json = {
      nullField: null
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toEqual({
      label: 'nullField',
      name: 'nullField',
      type: 'text',
      value: null,
      placeholder: 'Add nullField',
      isExplicit: false
    });
  });

  it('handles arrays with primitive values', async () => {
    const json = {
      numbers: [1, 2, 3],
      mixed: ['text', 42, true]
    };

    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toEqual({
      label: 'numbers',
      name: 'numbers',
      type: 'list',
      value: [1, 2, 3],
      placeholder: 'Add numbers',
      isExplicit: false
    });

    expect(result.fields[1]).toEqual({
      label: 'mixed',
      name: 'mixed',
      type: 'array',
      value: [
        {
          isExplicit: false,
          label: 'item',
          name: 'item',
          placeholder: 'Add item',
          type: 'text',
          value: 'text'
        },
        {
          isExplicit: false,
          label: 'item',
          name: 'item',
          placeholder: 'Add item',
          type: 'number',
          value: 42
        },
        {
          isExplicit: false,
          label: 'item',
          name: 'item',
          placeholder: 'Add item',
          type: 'checkbox',
          value: true
        }
      ],
      placeholder: 'Add mixed',
      isExplicit: false,
      noDeletion: false,
      isRequired: false,
      noDuplication: true
    });
  });

  it('handles undefined schema parameter', async () => {
    const json = {
      title: 'Test'
    };
    const result = await convertToSchemaObject(json, undefined);
    expect(result).toEqual({
      fields: [
        {
          label: 'title',
          name: 'title',
          type: 'text',
          value: 'Test',
          placeholder: 'Add title',
          isExplicit: false
        }
      ]
    });
  });

  it('handles schema with field definitions but no matching fields', async () => {
    const json = {
      title: 'Test'
    };
    const schema = [
      {
        name: 'description', // Field not present in json
        type: 'textarea',
        required: true
      }
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toEqual({
      label: 'title',
      name: 'title',
      type: 'text',
      value: 'Test',
      placeholder: 'Add title',
      isExplicit: false
    });
  });

  it('handles arrays with explicit schema for items', async () => {
    const json = {
      items: ['item1', 'item2']
    };
    const schema = [
      {
        name: 'items',
        type: 'array',
        items: {
          type: 'text',
          required: true
        }
      }
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toEqual({
      label: 'items',
      name: 'items',
      type: 'array',
      items: {
        type: 'text',
        required: true
      },
      value: ['item1', 'item2'],
      placeholder: 'Add items',
      isExplicit: true
    });
  });

  it('handles basic types', async () => {
    const json = {
      name: 'John',
      age: 30,
      isActive: true,
      description: 'Multiple\nline\ntext'
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields).toHaveLength(4);
    expect(result.fields.find((f) => f.name === 'description').type).toBe('textarea');
  });

  it('handles arrays and objects', async () => {
    const json = {
      simpleList: ['a', 'b', 'c'],
      complexArray: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ],
      nested: {
        key1: 'value1',
        key2: 'value2'
      }
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields.find((f) => f.name === 'simpleList').type).toBe('list');
    expect(result.fields.find((f) => f.name === 'complexArray').type).toBe('array');
    expect(result.fields.find((f) => f.name === 'nested').type).toBe('object');
  });

  it('applies schema definitions correctly', async () => {
    const json = {
      title: 'My Post',
      tags: ['tag1', 'tag2']
    };
    const schema = [
      {
        name: 'title',
        type: 'text',
        required: true
      },
      {
        name: 'tags',
        type: 'list',
        fields: []
      }
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields.find((f) => f.name === 'title').isExplicit).toBe(true);
    expect(result.fields.find((f) => f.name === 'title').required).toBe(true);
  });

  it('handles null and special values', async () => {
    const json = {
      nullField: null,
      dateField: new Date('2023-01-01'),
      emptyArray: [],
      mixedArray: [1, 'text', true, { nested: 'value' }]
    };
    const result = await convertToSchemaObject(json);
    expect(result.fields.find((f) => f.name === 'nullField').type).toBe('text');
    expect(result.fields.find((f) => f.name === 'dateField').type).toBe('date');
    expect(result.fields.find((f) => f.name === 'mixedArray').type).toBe('array');
  });

  it('handles nested schema definitions', async () => {
    const json = {
      meta: {
        author: 'John',
        stats: {
          views: 100
        }
      }
    };
    const schema = [
      {
        name: 'meta',
        type: 'object',
        fields: [
          {
            name: 'author',
            type: 'text'
          },
          {
            name: 'stats',
            type: 'object',
            fields: [
              {
                name: 'views',
                type: 'number'
              }
            ]
          }
        ]
      }
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0].fields[0].isExplicit).toBe(true);
    expect(result.fields[0].fields[1].fields[0].type).toBe('number');
  });

  it('handles edge cases in schema field definitions', async () => {
    const json = {
      field1: 'value1'
    };
    const schema = [
      {
        name: 'field1',
        type: 'invalid_type',
        additionalProp: 'test'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'invalid_type',
      value: 'value1',
      isExplicit: true
    });
  });

  it('handles undefined schema parameter', async () => {
    const json = {
      field1: 'value1'
    };

    const result = await convertToSchemaObject(json);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false
    });
  });

  it('handles schema with non-matching field names', async () => {
    const json = {
      field1: 'value1'
    };
    const schema = [
      {
        name: 'different_field',
        type: 'text'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false // Should be false since no schema match found
    });
  });

  it('handles schema with missing name property', async () => {
    const json = {
      field1: 'value1'
    };
    const schema = [
      {
        type: 'text' // Missing name property
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false // Should be false since schema field is invalid
    });
  });

  it('handles schema with empty string name', async () => {
    const json = {
      '': 'empty key' // Empty string as key
    };
    const schema = [
      {
        name: '',
        type: 'text'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: '',
      type: 'text',
      value: 'empty key',
      isExplicit: true
    });
  });

  it('handles schema with special characters in name', async () => {
    const json = {
      '@special.key': 'special value'
    };
    const schema = [
      {
        name: '@special.key',
        type: 'text'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: '@special.key',
      type: 'text',
      value: 'special value',
      isExplicit: true
    });
  });

  it('handles schema with undefined name property', async () => {
    const json = {
      field1: 'value1'
    };
    const schema = [
      {
        name: undefined,
        type: 'text'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false
    });
  });
});

describe('matchSchemaField edge cases', () => {
  it('handles undefined schema parameter', async () => {
    const json = {
      field1: 'value1'
    };
    const result = await convertToSchemaObject(json, undefined);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false
    });
  });

  it('handles empty schema array', async () => {
    const json = {
      field1: 'value1'
    };
    const result = await convertToSchemaObject(json, []);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: false
    });
  });

  it('handles schema with valid and invalid fields', async () => {
    const json = {
      field1: 'value1'
    };
    const schema = [
      { name: 'field1', type: 'text' },
      { type: 'text' }, // missing name
      { name: 'field2' } // different field
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'text',
      value: 'value1',
      isExplicit: true
    });
  });

  it('handles schema with mixed field definitions', async () => {
    const json = {
      field1: 'value1',
      field2: 'value2'
    };
    const schema = [
      { name: 'field1', type: 'textarea' },
      { name: 'field2' } // missing type
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields).toHaveLength(2);
    expect(result.fields[0]).toMatchObject({
      name: 'field1',
      type: 'textarea',
      value: 'value1',
      isExplicit: true
    });
    expect(result.fields[1]).toMatchObject({
      name: 'field2',
      type: 'text', // default type
      value: 'value2',
      isExplicit: true
    });
  });
});

describe('convertToSchemaObject schema handling', () => {
  it('handles invalid schema input', async () => {
    const json = { key: 'value' };
    const invalidSchema = 'not-an-array';

    const result = await convertToSchemaObject(json, invalidSchema);
    expect(result.fields[0]).toMatchObject({
      name: 'key',
      value: 'value',
      isExplicit: false
    });
  });

  it('handles undefined schema', async () => {
    const json = { key: 'value' };

    const result = await convertToSchemaObject(json, undefined);
    expect(result.fields[0]).toMatchObject({
      name: 'key',
      value: 'value',
      isExplicit: false
    });
  });

  it('handles array type schema without fields property', async () => {
    const json = {
      testArray: ['item1', 'item2']
    };
    const schema = [
      {
        name: 'testArray',
        type: 'array'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'testArray',
      type: 'array',
      value: ['item1', 'item2'],
      isExplicit: true
    });
  });

  it('handles object type schema without fields property', async () => {
    const json = {
      testObject: {
        nestedKey: 'value'
      }
    };
    const schema = [
      {
        name: 'testObject',
        type: 'object'
      }
    ];

    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'testObject',
      type: 'object',
      value: { nestedKey: 'value' },
      isExplicit: true,
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: 'nestedKey',
          value: 'value',
          isExplicit: false
        })
      ])
    });
  });
});

describe('convertToSchemaObject schema validation', () => {
  // Test for invalid schema input (covers matchSchemaField line 26)
  test('handles non-array schema input', async () => {
    const json = { test: 'value' };
    const result = await convertToSchemaObject(json, null);
    expect(result.fields[0]).toMatchObject({
      name: 'test',
      value: 'value',
      isExplicit: false
    });
  });

  // Test for schema fields with invalid names (covers matchSchemaField filtering)
  test('handles schema fields with invalid names', async () => {
    const json = { test: 'value' };
    const schema = [
      { type: 'text', value: 'test' }, // missing name
      { name: null, type: 'text' }, // null name
      { name: undefined, type: 'text' } // undefined name
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'test',
      type: 'text',
      value: 'value',
      isExplicit: false // should be false since no valid schema match was found
    });
  });

  // Test for schema field with undefined type (covers createField line 46)
  test('handles schema field with undefined type', async () => {
    const json = { test: 'value' };
    const schema = [
      { name: 'test', value: 'value' } // missing type
    ];
    const result = await convertToSchemaObject(json, schema);
    expect(result.fields[0]).toMatchObject({
      name: 'test',
      type: 'text', // should fall back to inferred type
      value: 'value',
      isExplicit: true // should be true since name matched
    });
  });
});

describe('matchSchemaField', () => {
  it('returns undefined when schema is not an array', () => {
    expect(matchSchemaField('test', null)).toBeUndefined();
    expect(matchSchemaField('test', undefined)).toBeUndefined();
    expect(matchSchemaField('test', 'not-an-array')).toBeUndefined();
  });

  it('returns undefined when no matching field is found', () => {
    const schema = [{ name: 'other', type: 'text' }];
    expect(matchSchemaField('test', schema)).toBeUndefined();
  });

  it('returns matching schema field', () => {
    const schema = [{ name: 'test', type: 'text' }];
    expect(matchSchemaField('test', schema)).toEqual({ name: 'test', type: 'text' });
  });
});

describe('createField', () => {
  it('uses schema field properties when provided', () => {
    const schemaField = { name: 'test', type: 'textarea' };
    const result = createField('test', 'value', schemaField);
    expect(result).toMatchObject({
      name: 'test',
      value: 'value',
      type: 'text',
      isExplicit: false,
      placeholder: 'Add test'
    });
  });

  it('creates field without schema field', () => {
    const result = createField('test', 'value');
    expect(result).toMatchObject({
      name: 'test',
      value: 'value',
      type: 'text',
      isExplicit: false,
      placeholder: 'Add test'
    });
  });

  it('sets default placeholder', () => {
    const schemaField = {
      name: 'test',
      type: 'text'
    };
    const result = createField('test', 'value', schemaField);
    expect(result.placeholder).toBe('Add test');
  });
});
