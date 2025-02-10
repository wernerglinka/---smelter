import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const NumberField = ({ field }) => {
  return (
    <BaseField
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
    >
      <label className="label-wrapper">
        <span>{toTitleCase(field.label)}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            defaultValue={field.label || ''}
            readOnly
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Number for {field.label}</span>
        <div>
          <input
            type="number"
            name={field.name}
            defaultValue={field.value || ''}
            placeholder={`Enter ${field.label}`}
          />
        </div>
      </label>
    </BaseField>
  );
};
