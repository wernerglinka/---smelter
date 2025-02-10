import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const CheckboxField = ({ field }) => {
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
        <span className="hint">Checkbox for {field.label}</span>
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
