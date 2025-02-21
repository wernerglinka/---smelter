// Import the actual module to mock
const storageModule = require('@services/storage.js');
const {
  convertToSchemaObject
} = require('../../../../src/renderer/src/lib/form-generation/schema/convert-js-to-schema');

// Mock the storage operations
jest.mock('@services/storage.js', () => ({
  StorageOperations: {
    getProjectPath: jest.fn(() => '/mock/project/path')
  }
}));

// Mock schema-handler
jest.mock('../../../../src/renderer/src/lib/form-generation/schema/schema-handler', () => ({
  getExplicitSchema: jest.fn().mockResolvedValue({})
}));

// Mock schema validation - now returns void instead of throwing
jest.mock('../../../../src/renderer/src/lib/form-generation/schema/validate-schema', () => ({
  validateSchema: jest.fn()
}));

import { processFrontmatter } from '../../../../src/renderer/src/lib/form-generation/processors/frontmatter-processor';

describe('FrontmatterProcessor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processes frontmatter with explicit schema from fields.json', async () => {
    const explicitSchema = [
      {
        label: 'sections',
        type: 'array',
        fields: [
          {
            label: 'Container',
            name: 'container',
            type: 'select',
            options: [
              { label: 'Article', value: 'article' },
              { label: 'Section', value: 'section' }
            ]
          },
          {
            label: 'Name',
            name: 'name',
            type: 'text'
          }
        ]
      }
    ];

    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      explicitSchema
    );

    const frontmatter = {
      sections: [
        {
          container: 'section',
          name: 'text'
        }
      ]
    };

    const result = await processFrontmatter(frontmatter, '');

    expect(result.fields).toHaveLength(1);
    const sectionsField = result.fields[0];
    expect(sectionsField).toMatchObject({
      label: 'sections',
      type: 'array',
      value: [
        {
          container: 'section',
          name: 'text'
        }
      ]
    });
  });

  test('processes nested object structures', async () => {
    const explicitSchema = [
      {
        label: 'seo',
        type: 'object',
        fields: [
          {
            label: 'Title',
            name: 'title',
            type: 'text'
          },
          {
            label: 'Description',
            name: 'description',
            type: 'textarea'
          }
        ]
      }
    ];

    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      explicitSchema
    );

    const frontmatter = {
      seo: {
        title: 'Page Title',
        description: 'Page Description'
      }
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields[0]).toMatchObject({
      label: 'seo',
      type: 'object',
      value: frontmatter.seo
    });
  });

  test('handles empty frontmatter', async () => {
    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      []
    );

    const result = await processFrontmatter({}, '');
    expect(result.fields).toEqual([]);
  });

  test('processes primitive fields without schema', async () => {
    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      []
    );

    const frontmatter = {
      layout: 'default.njk',
      draft: false,
      navLabel: 'Home'
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(3);
    expect(result.fields).toEqual([
      {
        label: 'layout',
        type: 'text',
        value: 'default.njk',
        placeholder: 'Add layout'
      },
      {
        label: 'draft',
        type: 'checkbox',
        value: false,
        placeholder: 'Add draft'
      },
      {
        label: 'navLabel',
        type: 'text',
        value: 'Home',
        placeholder: 'Add navLabel'
      }
    ]);
  });

  /**
   * Tests the processing of complex nested data structures into form fields.
   * This test verifies that the processor correctly:
   * 1. Maintains the hierarchical structure of the input data
   * 2. Generates appropriate field metadata for each level
   * 3. Handles arrays, objects, and primitive values correctly
   * 4. Preserves the original data while adding UI-specific properties
   */
  test('processes complex nested structures', async () => {
    // Sample frontmatter with nested structure:
    // - Array (sections)
    //   - Object (section item)
    //     - Primitive (container)
    //     - Object (containerFields)
    //       - Primitive (isDisabled)
    //       - Object (background)
    //         - Primitives (color, isDark)
    const frontmatter = {
      sections: [
        {
          container: 'section',
          containerFields: {
            isDisabled: false,
            background: {
              color: '',
              isDark: false
            }
          }
        }
      ]
    };

    const result = await processFrontmatter(frontmatter, '');

    // The expected structure includes form-specific metadata:
    // - Each field gets label, type, and placeholder
    // - Arrays get isDropzone and dropzoneType
    // - Objects get a fields array for nested elements
    // - Original values are preserved in the value property
    expect(result.fields[0]).toMatchObject({
      label: 'sections',
      type: 'array',
      placeholder: 'Add sections',
      isDropzone: true,
      dropzoneType: 'sections',
      value: [
        {
          fields: [
            {
              label: 'container',
              type: 'text',
              value: 'section',
              placeholder: 'Add container'
            },
            {
              label: 'containerFields',
              type: 'object',
              fields: [
                {
                  label: 'isDisabled',
                  type: 'checkbox',
                  value: false,
                  placeholder: 'Add isDisabled'
                },
                {
                  label: 'background',
                  type: 'object',
                  fields: [
                    {
                      label: 'color',
                      type: 'text',
                      value: '',
                      placeholder: 'Add color'
                    },
                    {
                      label: 'isDark',
                      type: 'checkbox',
                      value: false,
                      placeholder: 'Add isDark'
                    }
                  ],
                  placeholder: 'Add background',
                  value: {
                    color: '',
                    isDark: false
                  }
                }
              ],
              placeholder: 'Add containerFields',
              value: {
                isDisabled: false,
                background: {
                  color: '',
                  isDark: false
                }
              }
            }
          ],
          label: 'Item 1',
          type: 'object',
          value: {
            container: 'section',
            containerFields: {
              isDisabled: false,
              background: {
                color: '',
                isDark: false
              }
            }
          }
        }
      ]
    });
  });

  test('ensures objects have fields property while preserving explicit schema', async () => {
    const explicitSchema = [
      {
        label: 'seo',
        type: 'object',
        noDuplication: true
      }
    ];

    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      explicitSchema
    );

    const frontmatter = {
      seo: {
        title: 'Test Page',
        description: 'A test page',
        socialImage: ''
      }
    };

    const result = await processFrontmatter(frontmatter, '');

    expect(result.fields[0]).toMatchObject({
      label: 'seo',
      type: 'object',
      noDuplication: true,
      fields: expect.arrayContaining([
        expect.objectContaining({
          label: 'Title',
          type: 'text',
          value: 'Test Page'
        })
      ])
    });
  });

  test('handles schema validation errors', async () => {
    require('../../../../src/renderer/src/lib/form-generation/schema/validate-schema').validateSchema.mockImplementation(
      () => {
        throw new Error('Invalid schema structure');
      }
    );

    await expect(processFrontmatter({}, '')).rejects.toThrow('Invalid schema structure');
  });
});
