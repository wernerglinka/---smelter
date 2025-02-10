import React from 'react';
import { TextField } from './fields/TextField';
import { TextArea } from './fields/TextArea';
import { NumberField } from './fields/NumberField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { UrlField } from './fields/UrlField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { SectionsArrayField } from './fields/SectionsArrayField';

export const FormField = ({ field, schema, onChange }) => {
  if (!field) {
    console.warn('FormField received null or undefined field');
    return null;
  }

  const commonProps = {
    field: field,
    onChange: onChange,
    schema: schema?.[field.name]
  };

  // First check if it's a sections array based on schema type
  if (schema?.type === 'SECTIONS_ARRAY' ||
      (field.type === 'array' && field.name === 'sections')) {
    return <SectionsArrayField {...commonProps} />;
  }

  // Then handle regular arrays
  if (field.type === 'array') {
    return <ArrayField {...commonProps} />;
  }

  // Then handle objects
  if (field.type === 'object') {
    return <ObjectField {...commonProps} />;
  }

  // Finally handle all other field types
  switch (field.type) {
    case 'textarea':
      return <TextArea {...commonProps} />;
    case 'number':
      return <NumberField {...commonProps} />;
    case 'checkbox':
      return <CheckboxField {...commonProps} />;
    case 'select':
      return <SelectField {...commonProps} options={field.options} />;
    case 'url':
      return <UrlField {...commonProps} />;
    default:
      return <TextField {...commonProps} />;
  }
};
