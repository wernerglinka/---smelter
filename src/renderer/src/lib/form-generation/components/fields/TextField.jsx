import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

export const TextField = ({ field = {}, implicitDef }) => {
  const label = field.label || field.name || 'Untitled';

  return (
    <BaseField
      allowDuplication={!implicitDef?.noDuplication}
      allowDeletion={!implicitDef?.noDeletion}
    >
      <label className="label-wrapper">
        <span>{toTitleCase(label)}</span>
        <div>
          <input
            type="text"
            className="element-label"
            placeholder="Label Placeholder"
            defaultValue={label}
            readOnly
          />
        </div>
      </label>
      <label className="content-wrapper">
        <span className="hint">Text for {label}</span>
        <div>
          <input
            type="text"
            name={field.name}
            placeholder={`Enter ${label.toLowerCase()}`}
            defaultValue={field.value || ''}
          />
        </div>
      </label>
    </BaseField>
  );
};
