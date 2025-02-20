import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const CheckboxField = ({ field }) => {
  const label = field.label || field.name || '';

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
        <span className="hint">Checkbox for {label || 'field'}</span>
        <div>
          <input
            type="checkbox"
            role="switch"
            name={field.name}
            className="checkbox-input"
            defaultChecked={field.value || false}
          />
        </div>
      </label>
    </BaseField>
  );
};
