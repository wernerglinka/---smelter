export const baseFields = [
  {
    type: 'text',
    name: 'text_field',
    label: 'Text Field',
    value: '',
    placeholder: 'Enter text'
  },
  {
    type: 'textarea',
    name: 'textarea_field',
    label: 'Text Area',
    value: '',
    placeholder: 'Enter long text'
  },
  {
    type: 'number',
    name: 'number_field',
    label: 'Number Field',
    value: '',
    placeholder: 'Enter a number'
  },
  {
    type: 'checkbox',
    name: 'checkbox_field',
    label: 'Checkbox Field',
    value: false
  },
  {
    type: 'select',
    name: 'select_field',
    label: 'Select Field',
    value: '',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' }
    ]
  },
  {
    type: 'url',
    name: 'url_field',
    label: 'URL Field',
    value: '',
    placeholder: 'Enter URL'
  },
  {
    type: 'object',
    name: 'object_field',
    label: 'Object Field',
    fields: []
  },
  {
    type: 'array',
    name: 'array_field',
    label: 'Array Field',
    value: []
  },
  {
    type: 'list',
    name: 'list_field',
    label: 'List Field',
    value: []
  }
];
