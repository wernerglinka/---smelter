import React from 'react';
import { createFieldDefinition } from '../utils/field-utils';
import { TextField } from './fields/TextField';
import { TextArea } from './fields/TextArea';
import { NumberField } from './fields/NumberField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { UrlField } from './fields/UrlField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { SectionsArrayField } from './fields/SectionsArrayField';

export const FormField = ({ field }) => {
  if (!field) {
    console.warn('FormField received null or undefined field');
    return null;
  }

  // First check if it's a sections array based on schema type
  if ( field.type === 'array' && field.name === 'sections' ) {
    return <SectionsArrayField field={field} />;
  }

  // Then handle regular arrays
  if (field.type === 'array') {
    return <ArrayField field={field} />;
  }

  // Then handle objects
  if (field.type === 'object') {
    return <ObjectField field={field} />;
  }

  // Finally handle all simple field types
  switch (field.type) {
    case 'textarea':
      return <TextArea field={field} />;
    case 'number':
      return <NumberField field={field} />;
    case 'checkbox':
      return <CheckboxField field={field} />;
    case 'select':
      return <SelectField field={field} />;
    case 'url':
      return <UrlField field={field} />;
    default:
      return <TextField field={field} />;
  }
};
