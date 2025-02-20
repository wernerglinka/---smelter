/**
 * @module schema/field-types
 * @description Field type definitions matching project schema format
 */

export const FIELD_TYPES = {
  TEXT: {
    type: 'text',
    default: '',
    placeholder: true,
    canHaveLabel: true
  },
  TEXTAREA: {
    type: 'textarea',
    default: '',
    placeholder: true,
    canHaveLabel: true
  },
  NUMBER: {
    type: 'number',
    default: 0,
    placeholder: true,
    canHaveLabel: true
  },
  CHECKBOX: {
    type: 'checkbox',
    default: false,
    canHaveLabel: true
  },
  DATE: {
    type: 'date',
    default: '',
    placeholder: true,
    canHaveLabel: true
  },
  SELECT: {
    type: 'select',
    default: '',
    requiresOptions: true,
    canHaveLabel: true
  },
  URL: {
    type: 'url',
    default: '',
    placeholder: true,
    canHaveLabel: true
  },
  IMAGE: {
    type: 'image',
    default: '',
    placeholder: true,
    canHaveLabel: true
  },
  LIST: {
    type: 'list',
    default: [],
    canHaveLabel: true
  },
  ARRAY: {
    type: 'array',
    default: [],
    canHaveLabel: true,
    isDropzone: true
  },
  SECTIONS_ARRAY: {
    type: 'array',
    default: [],
    canHaveLabel: true,
    isDropzone: true, // Sections arrays are dropzones
    dropzoneType: 'sections' // Specifically for sections
  },
  OBJECT: {
    type: 'object',
    canHaveLabel: true
  }
};
