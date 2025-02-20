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

// Mock schema validation
jest.mock('../../../../src/renderer/src/lib/form-generation/schema/validate-schema', () => ({
  validateSchema: jest.fn()
}));

import { processFrontmatter } from '../../../../src/renderer/src/lib/form-generation/processors/frontmatter-processor';

describe('FrontmatterProcessor', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('processes simple frontmatter with primitive values', async () => {
    const frontmatter = {
      layout: 'default.njk',
      title: 'Test Page',
      draft: false,
      order: 1
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(4);
    expect(result.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'layout',
          type: 'text',
          value: 'default.njk'
        }),
        expect.objectContaining({
          label: 'title',
          type: 'text',
          value: 'Test Page'
        }),
        expect.objectContaining({
          label: 'draft',
          type: 'checkbox',
          value: false
        }),
        expect.objectContaining({
          label: 'order',
          type: 'number',
          value: 1
        })
      ])
    );
  });

  test('processes nested objects in frontmatter', async () => {
    const frontmatter = {
      seo: {
        title: 'SEO Title',
        description: 'SEO Description'
      }
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(1);
    const seoField = result.fields[0];
    expect(seoField).toMatchObject({
      label: 'seo',
      type: 'object',
      fields: expect.arrayContaining([
        expect.objectContaining({
          label: 'title',
          type: 'text',
          value: 'SEO Title'
        }),
        expect.objectContaining({
          label: 'description',
          type: 'text',
          value: 'SEO Description'
        })
      ])
    });
  });

  test('processes arrays with primitive values', async () => {
    const frontmatter = {
      tags: ['javascript', 'testing', 'jest']
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(1);
    const tagsField = result.fields[0];
    expect(tagsField).toMatchObject({
      label: 'tags',
      type: 'array',
      isDropzone: true,
      value: [
        expect.objectContaining({
          type: 'text',
          label: 'Item 1',
          value: 'javascript'
        }),
        expect.objectContaining({
          type: 'text',
          label: 'Item 2',
          value: 'testing'
        }),
        expect.objectContaining({
          type: 'text',
          label: 'Item 3',
          value: 'jest'
        })
      ]
    });
  });

  test('processes arrays with object values', async () => {
    const frontmatter = {
      sections: [
        {
          name: 'intro',
          type: 'text',
          content: 'Introduction section'
        },
        {
          name: 'features',
          type: 'list',
          items: ['Feature 1', 'Feature 2']
        }
      ]
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(1);
    const sectionsField = result.fields[0];
    expect(sectionsField).toMatchObject({
      label: 'sections',
      type: 'array',
      isDropzone: true,
      value: [
        expect.objectContaining({
          type: 'object',
          label: 'Item 1',
          fields: expect.arrayContaining([
            expect.objectContaining({
              label: 'name',
              value: 'intro'
            }),
            expect.objectContaining({
              label: 'type',
              value: 'text'
            }),
            expect.objectContaining({
              label: 'content',
              value: 'Introduction section'
            })
          ])
        }),
        expect.objectContaining({
          type: 'object',
          label: 'Item 2',
          fields: expect.arrayContaining([
            expect.objectContaining({
              label: 'name',
              value: 'features'
            }),
            expect.objectContaining({
              label: 'type',
              value: 'list'
            }),
            expect.objectContaining({
              label: 'items',
              type: 'array',
              value: [
                expect.objectContaining({
                  value: 'Feature 1'
                }),
                expect.objectContaining({
                  value: 'Feature 2'
                })
              ]
            })
          ])
        })
      ]
    });
  });

  test('handles empty frontmatter', async () => {
    const result = await processFrontmatter({}, '');
    expect(result.fields).toEqual([]);
  });

  test('handles null values', async () => {
    const frontmatter = {
      title: null,
      description: null
    };

    const result = await processFrontmatter(frontmatter, '');
    expect(result.fields).toHaveLength(2);
    expect(result.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'title',
          type: 'text',
          value: null
        }),
        expect.objectContaining({
          label: 'description',
          type: 'text',
          value: null
        })
      ])
    );
  });

  test('processes frontmatter with explicit schema from fields.json', async () => {
    const explicitSchema = {
      sections: {
        type: 'array',
        fields: {
          container: {
            label: 'Container',
            name: 'container',
            type: 'select',
            options: [
              { label: 'Article', value: 'article' },
              { label: 'Section', value: 'section' }
            ]
          },
          name: {
            label: 'Name',
            name: 'name',
            type: 'text'
          },
          containerFields: {
            label: 'Container Fields',
            name: 'containerFields',
            type: 'object',
            fields: {
              isDisabled: {
                label: 'Disabled',
                name: 'isDisabled',
                type: 'checkbox'
              },
              isAnimated: {
                label: 'Animated',
                name: 'isAnimated',
                type: 'checkbox'
              }
            }
          }
        }
      }
    };

    require('../../../../src/renderer/src/lib/form-generation/schema/schema-handler').getExplicitSchema.mockResolvedValue(
      explicitSchema
    );

    const frontmatter = {
      sections: [
        {
          container: 'section',
          name: 'text',
          containerFields: {
            isDisabled: false,
            isAnimated: true
          },
          text: {
            title: 'Test Section',
            subtitle: 'Test Subtitle'
          }
        }
      ]
    };

    const result = await processFrontmatter(frontmatter, '');

    expect(result.fields).toHaveLength(1);
    const sectionsField = result.fields[0];
    expect(sectionsField).toMatchObject({
      label: 'sections',
      type: 'array',
      isDropzone: true,
      value: [
        {
          type: 'object',
          label: 'Item 1',
          fields: [
            {
              label: 'container',
              type: 'text',
              placeholder: 'Add container',
              value: 'section'
            },
            {
              label: 'name',
              type: 'text',
              placeholder: 'Add name',
              value: 'text'
            },
            {
              label: 'containerFields',
              type: 'object',
              placeholder: 'Add containerFields',
              value: {
                isDisabled: false,
                isAnimated: true
              },
              fields: [
                {
                  label: 'isDisabled',
                  type: 'checkbox',
                  placeholder: 'Add isDisabled',
                  value: false
                },
                {
                  label: 'isAnimated',
                  type: 'checkbox',
                  placeholder: 'Add isAnimated',
                  value: true
                }
              ]
            },
            {
              label: 'text',
              type: 'object',
              placeholder: 'Add text',
              value: {
                title: 'Test Section',
                subtitle: 'Test Subtitle'
              },
              fields: [
                {
                  label: 'title',
                  type: 'text',
                  placeholder: 'Add title',
                  value: 'Test Section'
                },
                {
                  label: 'subtitle',
                  type: 'text',
                  placeholder: 'Add subtitle',
                  value: 'Test Subtitle'
                }
              ]
            }
          ]
        }
      ]
    });
  });

  test('processes real-world metalsmith page structure', async () => {
    const frontmatter = {
      layout: 'sections.njk',
      draft: false,
      navLabel: 'Home',
      bodyClasses: 'home-page',
      access: {
        noIndex: false,
        noFollow: false
      },
      seo: {
        title: 'Metalsmith First starter',
        description: 'Metalsmith First starter to build a static site with structured content',
        socialImage: 'path to social image',
        canonicalOverwrite: ''
      },
      sections: [
        {
          container: 'section',
          name: 'text',
          containerFields: {
            isDisabled: false,
            isAnimated: false,
            containerId: '',
            containerClass: '',
            inContainer: true,
            isNarrow: true,
            background: {
              color: '',
              image: '',
              isDark: false
            }
          },
          text: {
            prefix: '',
            title: 'Metalsmith First',
            header: 'h1',
            subtitle: "The only starter you'll need"
          }
        }
      ]
    };

    const result = await processFrontmatter(frontmatter, '');

    // Check sections field
    const sectionsField = result.fields.find((f) => f.label === 'sections');
    expect(sectionsField).toBeDefined();
    expect(sectionsField.type).toBe('array');
    expect(sectionsField.isDropzone).toBe(true);

    // Check first section
    const firstSection = sectionsField.value[0];
    expect(firstSection.type).toBe('object');
    expect(firstSection.label).toBe('Item 1');

    // Check basic fields
    const containerField = firstSection.fields.find((f) => f.label === 'container');
    expect(containerField).toMatchObject({
      type: 'text',
      value: 'section'
    });

    const nameField = firstSection.fields.find((f) => f.label === 'name');
    expect(nameField).toMatchObject({
      type: 'text',
      value: 'text'
    });

    // Check containerFields
    const containerFields = firstSection.fields.find((f) => f.label === 'containerFields');
    expect(containerFields.type).toBe('object');
    expect(containerFields.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'isDisabled',
          type: 'checkbox',
          value: false
        }),
        expect.objectContaining({
          label: 'isAnimated',
          type: 'checkbox',
          value: false
        })
      ])
    );

    // Check text fields
    const textField = firstSection.fields.find((f) => f.label === 'text');
    expect(textField.type).toBe('object');
    expect(textField.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'title',
          type: 'text',
          value: 'Metalsmith First'
        }),
        expect.objectContaining({
          label: 'subtitle',
          type: 'text',
          value: "The only starter you'll need"
        })
      ])
    );
  });
});
