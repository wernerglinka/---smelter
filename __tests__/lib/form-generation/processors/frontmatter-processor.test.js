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

    // Test the top-level structure
    expect(sectionsField).toMatchObject({
      label: 'Sections', // Title case in current implementation
      type: 'array'
    });

    // Test the array value structure
    expect(sectionsField.value).toHaveLength(1);
    expect(sectionsField.value[0]).toMatchObject({
      type: 'object',
      fields: expect.arrayContaining([
        expect.objectContaining({
          name: 'container',
          value: 'section'
        }),
        expect.objectContaining({
          name: 'name',
          value: 'text'
        })
      ]),
      value: {
        container: 'section',
        name: 'text'
      }
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
      label: 'Seo', // Title case in current implementation
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
        label: 'Layout', // Title case in current implementation
        name: 'layout',
        type: 'text',
        value: 'default.njk',
        placeholder: 'Add Layout',
        isExplicit: false
      },
      {
        label: 'Draft', // Title case in current implementation
        name: 'draft',
        type: 'checkbox',
        value: false,
        placeholder: 'Add Draft',
        isExplicit: false
      },
      {
        label: 'Nav Label', // Title case in current implementation
        name: 'navLabel',
        type: 'text',
        value: 'Home',
        placeholder: 'Add Nav Label',
        isExplicit: false
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

    // Only test the essential structure and values
    const sectionsField = result.fields[0];
    expect(sectionsField).toMatchObject({
      label: 'Sections', // Title case in current implementation
      type: 'array',
      value: expect.arrayContaining([
        expect.objectContaining({
          value: expect.objectContaining({
            container: 'section',
            containerFields: {
              isDisabled: false,
              background: {
                color: '',
                isDark: false
              }
            }
          })
        })
      ])
    });

    // Verify the presence of required properties without checking exact values
    expect(sectionsField.value[0]).toHaveProperty('fields');
    expect(sectionsField.value[0]).toHaveProperty('type', 'object');
    expect(sectionsField.value[0]).toHaveProperty('label');
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
      label: 'Seo', // Title case in current implementation
      type: 'object',
      noDuplication: true,
      fields: expect.arrayContaining([
        expect.objectContaining({
          label: 'Title', // Title case in current implementation
          name: 'title',
          type: 'text',
          value: 'Test Page',
          isExplicit: false
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

describe('processFrontmatter', () => {
  test('processes contents field correctly', async () => {
    // Reset the validation mock to not throw errors for this test
    require('../../../../src/renderer/src/lib/form-generation/schema/validate-schema').validateSchema.mockImplementation(
      () => true
    );

    const frontmatter = { title: 'Test' };
    const content = '# Test Content\n\nSome markdown content';

    const result = await processFrontmatter(frontmatter, content, { addContentsField: true });

    expect(result.fields).toContainEqual(
      expect.objectContaining({
        type: expect.stringMatching(/textarea/i),
        name: 'contents',
        label: 'Contents',
        value: content,
        id: 'markdown-contents',
        noDuplication: true,
        noDeletion: true
      })
    );
  });

  test('preserves contents when processing empty frontmatter', async () => {
    // Reset the validation mock to not throw errors for this test
    require('../../../../src/renderer/src/lib/form-generation/schema/validate-schema').validateSchema.mockImplementation(
      () => true
    );

    const frontmatter = {};
    const content = '# Just Content';

    const result = await processFrontmatter(frontmatter, content, { addContentsField: true });

    expect(result.fields.find((f) => f.name === 'contents')).toBeTruthy();
    expect(result.fields.find((f) => f.name === 'contents').value).toBe(content);
  });
});
