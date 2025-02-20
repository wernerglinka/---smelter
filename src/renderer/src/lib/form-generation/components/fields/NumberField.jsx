import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const NumberField = ({ field }) => {
  const label = field.label || field.name || '';

  return (
    <BaseField
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
    >
      <label className="label-wrapper">
        <span>{toTitleCase(label) || 'Label'}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            defaultValue={label}
            readOnly={!!label}
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Number for {label || 'field'}</span>
        <div>
          <input
            type="number"
            name={field.name}
            defaultValue={field.value || ''}
            placeholder={`Enter ${label || 'number'}`}
          />
        </div>
      </label>
    </BaseField>
  );
};
