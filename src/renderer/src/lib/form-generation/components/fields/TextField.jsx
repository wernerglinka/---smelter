import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const TextField = ({ field }) => {
  const label = field.label || '';

  return (
    <BaseField
      field={field}
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
        <span className="hint">Text for {label || 'field'}</span>
        <div>
          <input
            type="text"
            className="element-value"
            defaultValue={field.value}
            placeholder={`Add ${label || 'text'}`}
          />
        </div>
      </label>
    </BaseField>
  );
};
