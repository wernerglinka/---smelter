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
export const DateField = ({
  field,
  onDuplicate,
  onDelete,
  onUpdate,
  allowDuplication = !field?.noDuplication,
  allowDeletion = !field?.noDeletion
}) => {
  // Use _displayLabel for duplicated fields (with empty label but display text)
  // This allows the label to appear in the UI while still being editable
  const label = field._displayLabel || field.label || '';
  const formattedDate = formatDateForInput(field.value);
  
  // Handle date changes on blur
  const handleDateChange = (e) => {
    if (onUpdate && e.target.value !== formattedDate) {
      // Only send the bare minimum - id and new value
      onUpdate({
        id: field.id,
        type: field.type?.toLowerCase(), // Normalize to lowercase
        value: e.target.value
      });
    }
  };

  return (
    <BaseField
      field={field}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      allowDuplication={allowDuplication}
      allowDeletion={allowDeletion}
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
            className="element-value"
            defaultValue={formattedDate}
            placeholder={`Enter ${label || 'date'}`}
            onChange={handleDateChange}
          />
        </div>
      </label>
    </BaseField>
  );
};
