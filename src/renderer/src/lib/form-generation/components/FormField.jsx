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

export const FormField = ({ field, onUpdate }) => {
  // Add more detailed validation
  if (!field) {
    console.warn('FormField received null or undefined field', new Error().stack);
    return null;
  }

  if (!field.type) {
    console.warn('Field is missing required type property:', field);
    return null;
  }

  // Handle objects
  if (field.type === 'object') {
    return <ObjectField field={field} onUpdate={onUpdate} />;
  }

  // Handle arrays and lists
  if (field.type === 'array') {
    return <ArrayField field={field} onUpdate={onUpdate} />;
  }

  if (field.type === 'list') {
    return <ListField field={field} onUpdate={onUpdate} />;
  }

  // Handle simple field types
  switch (field.type.toLowerCase()) {
    case 'textarea':
      return <TextArea field={field} onUpdate={onUpdate} />;
    case 'number':
      return <NumberField field={field} onUpdate={onUpdate} />;
    case 'checkbox':
      return <CheckboxField field={field} onUpdate={onUpdate} />;
    case 'select':
      return <SelectField field={field} onUpdate={onUpdate} />;
    case 'url':
      return <UrlField field={field} onUpdate={onUpdate} />;
    default:
      return <TextField field={field} onUpdate={onUpdate} />;
  }
};
