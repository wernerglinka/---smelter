import { convertToSchemaObject } from '@lib/form-generation/schema/convert-js-to-schema';

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
});
