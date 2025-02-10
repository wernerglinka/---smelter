import React from 'react';
import { DragHandleIcon } from '@components/icons';
import { FormField } from '../FormField';

export const SectionsArrayField = ({ field, schema, onChange }) => {
  const handleFieldChange = (sectionIndex, key, value, path) => {
    const newSections = [...(field.value || [])];
    if (path) {
      const pathParts = path.split('.');
      let current = newSections[sectionIndex];
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;
    } else {
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        [key]: value
      };
    }
    onChange?.(newSections);
  };

  return (
    <div className="form-element is-array no-drop label-exists" draggable="true">
      <span className="sort-handle">
        <DragHandleIcon />
      </span>
      <label className="object-name label-wrapper">
        <span>sections<sup>*</sup></span>
        <input
          type="text"
          className="element-label"
          placeholder="Array Name"
          readOnly
          value="sections"
        />
      </label>
      <div className="array-dropzone dropzone js-dropzone" data-wrapper="is-array">
        {(field.value || []).map((section, index) => (
          <div key={index} className="form-element is-object label-exists no-drop" draggable="true">
            <span className="sort-handle">
              <DragHandleIcon />
            </span>
            <label className="object-name label-wrapper label-exists">
              <span>{section.name || `Section ${index + 1}`}</span>
              <span className="hint">Sections Object</span>
            </label>
            <div className="object-dropzone dropzone js-dropzone">
              {Object.entries(section).map(([key, value]) => {
                if (key === 'containerFields') {
                  return (
                    <div key={key} className="form-element is-object label-exists no-drop" draggable="true">
                      <span className="sort-handle">
                        <DragHandleIcon />
                      </span>
                      <label className="object-name label-wrapper label-exists">
                        <span>Container Fields</span>
                        <span className="hint">Container Settings</span>
                      </label>
                      <div className="object-dropzone dropzone js-dropzone">
                        {Object.entries(value).map(([cfKey, cfValue]) => {
                          if (cfKey === 'background') {
                            return (
                              <div key={cfKey} className="form-element is-object label-exists no-drop" draggable="true">
                                <span className="sort-handle">
                                  <DragHandleIcon />
                                </span>
                                <label className="object-name label-wrapper label-exists">
                                  <span>Background</span>
                                  <span className="hint">Background Settings</span>
                                </label>
                                <div className="object-dropzone dropzone js-dropzone">
                                  {Object.entries(cfValue).map(([bgKey, bgValue]) => (
                                    <FormField
                                      key={bgKey}
                                      field={{
                                        name: bgKey,
                                        label: bgKey.charAt(0).toUpperCase() + bgKey.slice(1),
                                        value: bgValue,
                                        type: typeof bgValue === 'boolean' ? 'checkbox' : 'text',
                                        placeholder: `Enter background ${bgKey}`
                                      }}
                                      schema={schema}
                                      onChange={(newValue) =>
                                        handleFieldChange(index, bgKey, newValue, `containerFields.background.${bgKey}`)}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return (
                            <FormField
                              key={cfKey}
                              field={{
                                name: cfKey,
                                label: cfKey.charAt(0).toUpperCase() + cfKey.slice(1).replace(/([A-Z])/g, ' $1'),
                                value: cfValue,
                                type: typeof cfValue === 'boolean' ? 'checkbox' : 'text',
                                placeholder: `Enter ${cfKey}`
                              }}
                              schema={schema}
                              onChange={(newValue) =>
                                handleFieldChange(index, cfKey, newValue, `containerFields.${cfKey}`)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <FormField
                    key={key}
                    field={{
                      name: key,
                      label: key.charAt(0).toUpperCase() + key.slice(1),
                      value: value,
                      type: typeof value === 'boolean' ? 'checkbox' : 'text',
                      placeholder: `Enter ${key}`
                    }}
                    schema={schema}
                    onChange={(newValue) => handleFieldChange(index, key, newValue)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


