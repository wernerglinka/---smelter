import React from 'react';
import { TextField } from './fields/TextField';

export const Form = ({ initialData, schema }) => {
  return (
    <div className="form-container">
      {initialData.map(field => (
        <TextField
          key={field.name}
          field={field}
          schema={schema}
        />
      ))}
    </div>
  );
};
