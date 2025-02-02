# Project Structure

## Overview
Metallurgy requires a specific project structure to function properly. The core of this structure is the `.metallurgy` folder in the project root, which contains configuration and schema files.

## `.metallurgy` Directory
This hidden directory contains all Metallurgy-specific configurations and is required in the project root.

### Required Files

#### 1. `projectData.json`
The primary configuration file that defines project paths:

```json
{
  "projectPath": "../../../../../metalsmith-first",
  "contentPath": "../../../../../metalsmith-first/src",
  "dataPath": "../../../../../metalsmith-first/lib/data"
}
```

Key paths:
- `projectPath`: Absolute path to the project root
- `contentPath`: Absolute path to the content directory (typically contains markdown files)
- `dataPath`: Absolute path to the data directory (contains site-wide data files)

#### 2. `frontMatterTemplates/fields.json`
A crucial configuration file that defines the available form fields and their properties. This schema is used when converting YAML frontmatter to form fields and vice versa.

Example structure:
```json
[
  {
    "name": "layout",
    "type": "select",
    "label": "Layout",
    "default": "sections.njk",
    "options": [
      {
        "label": "Default",
        "value": "default.njk"
      },
      {
        "label": "Sections",
        "value": "sections.njk"
      }
    ],
    "noDeletion": true,
    "isRequired": true,
    "noDuplication": true
  },
  {
    "name": "title",
    "type": "text",
    "label": "Title",
    "default": "",
    "placeholder": "Add a title",
    "noDeletion": true,
    "isRequired": true,
    "noDuplication": true
  }
]
```

Field properties:
- `name`: Field identifier matching YAML key
- `type`: Input type (text, select, checkbox, textarea, etc.)
- `label`: Display label in the form
- `default`: Default value
- `placeholder`: Input placeholder text
- `noDeletion`: Whether field can be removed
- `isRequired`: Whether field is mandatory
- `noDuplication`: Whether field can be duplicated
- `options`: Array of options for select fields

## Project Root Structure
A typical Metalsmith project using Metallurgy should look like this:

```
project-root/
├── .metallurgy/
│   ├── projectData.json
│   └── schema/
├── src/
│   ├── assets/
│   ├── layouts/
│   ├── partials/
│   └── content/
├── lib/
│   └── data/
└── package.json
```

### Content Directory Structure
The content directory (`src/`) typically contains:
- Markdown files with YAML frontmatter
- Template files
- Static assets
- Layout files

### Data Directory Structure
The data directory (`lib/data/`) contains:
- Site-wide configuration files
- Reusable data structures
- Global settings

## Validation
When opening a project, Metallurgy validates:
1. Existence of `.metallurgy` directory
2. Presence of required `projectData.json`
3. Accessibility of specified paths
4. Validity of project structure

## Best Practices
1. Keep `.metallurgy` in version control
2. Use relative paths when possible
3. Maintain consistent content structure
4. Follow Metalsmith conventions for project organization

## Related Documentation
- [Project Selection](../flows/project-selection.md)
- [File Editing](../flows/file-editing.md)
- [Schema Configuration](../technical/schema-configuration.md)
