# YAML Frontmatter to the Edit Form Fields - Part 2

YAML Frontmatter defines content in modular and component-based web development. In Part 1, we explored how YAML Frontmatter is represented as form fields in an edit form. In this part, we’ll examine how the HTML structure of a form field is derived from the YAML object.

## The YAML Object Example
```YAML
---
layout: blocks.njk
draft: false
bodyClasses: index-page and-some
seo:
  title: Metalsmith First starter
  description: Metalsmith First starter to build a static site with structured content
  socialImage: ""
  canonicalOverwrite: ""
sections:
  - container: section
    name: text
    sectionDescription: Simple Text Section
    containerFields:
      isDisabled: false
      isAnimated: false
      containerId: new-container-id
      containerClass: ""
      inContainer: true
      isNarrow: true
      background:
        color: ""
        image: ""
        isDark: true
    text:
      prefix: ""
      title: Metalsmith First
      header: h1
      subtitle: The only starter you'll need
      prose: Mucho more text here...
---
```

### Mapping the `layout` Field

```yaml
layout: "blocks.njk"
```

In YAML, the layout field is read as a string. However, the rendered form field appears as a select dropdown with blocks.njk pre-selected. This transformation occurs because the form generator also references an optional schema JSON object.

### Schema Definition for `layout`

```json
{
  "label": "layout",
  "type": "select",
  "value": "blocks.njk",
  "options": [
      {
          "label": "Default",
          "value": "default.njk"
      },
      {
          "label": "Sections",
          "value": "sections.njk"
      },
      {
          "label": "Blocks",
          "value": "blocks.njk"
      }
  ],
  "default": "sections.njk"
}
```

The schema defines:

- `label`: Field name matching the YAML key.
- `type`: Input type (select).
- `value`: Current selection.
- `options`: Available dropdown options.
- `default`: Default selection.

### Generating the Form

When a Markdown file is selected, its frontmatter is parsed into a JSON object and passed into frontmatterToForm().

**Incoming Frontmatter JSON Example**

```json
{
  "layout": "blocks.njk",
  "draft": false,
  "bodyClasses": "index-page and-some",
  "seo": {
    "title": "Metalsmith First starter",
    "description": "Metalsmith First starter to build a static site with structured content",
    "socialImage": "",
    "canonicalOverwrite": ""
  },
  "sections": [
    {
      "container": "section",
      "name": "text",
      "sectionDescription": "Simple Text Section",
      "containerFields": {
        "isDisabled": false,
        "isAnimated": false,
        "containerId": "new-container-id",
        "containerClass": "",
        "inContainer": true,
        "isNarrow": true,
        "background": {
          "color": "",
          "image": "",
          "isDark": true
        }
      },
      "text": {
        "prefix": "",
        "title": "Metalsmith First",
        "header": "h1",
        "subtitle": "The only starter you'll need",
        "prose": "Mucho more text here..."
      }
    }
  ]
}
```

### Processing the Frontmatter
1. Parsing the YAML:
The YAML is converted into JSON using processFrontmatter().

2. Type Inference:
Using convertToSchemaObject(), each property is examined, and a base field object is created by matching types with field validators.

**Inferred Base Field for layout**

```JSON
{
  "label": "layout",
  "type": "text",
  "value": "blocks.njk",
  "placeholder": "Add layout"
},
```

### Enhancing with Schema

If a schema.json file exists in the project, the schema properties for the layout field are merged into the base field object:

```JSON
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
    },
    {
      "label": "Blocks",
      "value": "blocks.njk"
    }
  ],
  "noDeletion": true,
  "isRequired": true,
  "noDuplication": true
}
```
### Creating the Form Element

Using `createFormFragment()`, the form field is generated based on the enhanced schema. The field is rendered within the form’s dropzone.

**Rendered HTML for `layout`**

```html
<div class="label-exists form-element no-drop" draggable="true">
  <span class="sort-handle">...Icon for drag handle...</span>
    <label class="label-wrapper">
      <span>Text Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Text for Text element</span>
      <div> 
        <select class="element-value">
          <option value="default.njk">Default</option>
          <option value="sections.njk">Sections</option>
          <option value="blocks.njk">Blocks</option>
        </select>
      </div>
    </label>
    <div class="button-wrapper"></div>
  </div>
  ```

  By combining the frontmatter JSON and its corresponding schema, the form generator produces accurate, interactive form fields with appropriate labels, input types, and validation rules. This method ensures a dynamic editing experience that reflects the structure and content of the original YAML object.