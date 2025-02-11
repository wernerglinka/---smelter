import React from 'react';
import { TextField } from './fields/TextField';
import { TextArea } from './fields/TextArea';
import { NumberField } from './fields/NumberField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { UrlField } from './fields/UrlField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { ListField } from './fields/ListField';

export const FormField = ({ field }) => {
  if (!field) {
    console.warn('FormField received null or undefined field');
    return null;
  }

  // Handle objects
  if (field.type === 'object') {
    return <ObjectField field={field} />;
  }

  // Handle arrays and lists
  if (field.type === 'array') {
    return <ArrayField field={field} />;
  }

  if (field.type === 'list') {
    return <ListField field={field} />;
  }

  // Handle simple field types
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
