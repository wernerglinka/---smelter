export const baseTemplate = {
  fields: [
    // ... other fields
    {
      type: 'TEXTAREA',
      name: 'contents',
      label: 'Contents',
      value: '',
      id: 'markdown-contents',
      noDuplication: true,
      noDeletion: true
    }
  ]
};
