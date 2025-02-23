import React from 'react';
import { BaseField } from './BaseField';
import { toTitleCase } from '@lib/utilities/formatting/to-title-case';

/**
 * Formats a date string to be compatible with HTML date input
 * @param {string} dateString - The input date string
 * @returns {string} Date formatted as YYYY-MM-DD
 */
const formatDateForInput = (dateString) => {
  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }

  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};
export const DateField = ({ field }) => {
  const label = field.label || '';
  const formattedDate = formatDateForInput(field.value);

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
        <span className="hint">Date for {label}</span>
        <div>
          <input
            type="date"
            name={field.id}
            defaultValue={formattedDate}
            placeholder={`Enter ${label || 'date'}`}
          />
        </div>
      </label>
    </BaseField>
  );
};
