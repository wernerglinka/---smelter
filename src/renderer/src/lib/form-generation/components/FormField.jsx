import React from 'react';
import { TextField } from './fields/TextField';
import { TextArea } from './fields/TextArea';
import { ListField } from './fields/ListField';
import { ArrayField } from './fields/ArrayField';
import { SectionsArrayField } from './fields/SectionsArrayField';
import { CheckboxField } from './fields/CheckboxField';
import { ObjectField } from './fields/ObjectField';

export const FormField = ({ field, implicitDef }) => {
  // Check if it's a sections array
  if (field.type === 'array' && field.dropzoneType === 'sections') {
    return <SectionsArrayField field={field} implicitDef={implicitDef} />;
  }

  switch (field.type.toLowerCase()) {
    case 'text':
      return <TextField field={field} implicitDef={implicitDef} />;
    case 'textarea':
      return <TextArea field={field} implicitDef={implicitDef} />;
    case 'list':
      return <ListField field={field} implicitDef={implicitDef} />;
    case 'array':
      return <ArrayField field={field} implicitDef={implicitDef} />;
    case 'checkbox':
      return <CheckboxField field={field} implicitDef={implicitDef} />;
    case 'object':
      return <ObjectField field={field} implicitDef={implicitDef} />;
    default:
      console.warn(`Unsupported field type: ${field.type}`);
      return null;
  }
};
