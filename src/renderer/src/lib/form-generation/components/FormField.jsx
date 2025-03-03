import React from 'react';
import { TextField } from './fields/TextField';
import { TextArea } from './fields/TextArea';
import { NumberField } from './fields/NumberField';
import { CheckboxField } from './fields/CheckboxField';
import { SelectField } from './fields/SelectField';
import { UrlField } from './fields/UrlField';
import { ObjectField } from './fields/ObjectField';
import { ArrayField } from './fields/ArrayField';
import { ListField } from './fields/ListField';
import { DateField } from './fields/DateField';

/**
 * Generic form field component that renders the appropriate field type
 * and passes along duplication/deletion handlers
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.field - Field configuration object
 * @param {Function} [props.onFieldDuplicate] - Handler for field duplication
 * @param {Function} [props.onFieldDelete] - Handler for field deletion
 * @param {string} [props.parentType] - Type of parent container ('main', 'array', 'object', 'list')
 * @returns {JSX.Element} Rendered form field
 */
export const FormField = ({ 
  field, 
  onFieldDuplicate,
  onFieldDelete,
  parentType = 'main' // 'main', 'array', 'object', 'list'
}) => {
  if (!field || !field.type) {
    console.error('FormField received invalid field:', field);
    return null;
  }

  // Container field types handle their own controls
  if (field.type === 'object') {
    return <ObjectField
      field={field}
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
      onDuplicate={onFieldDuplicate ? () => {
        console.log('FormField: Trying to duplicate object:', field.id, 'parent:', field.parentId);
        
        // Call handler and check if it returns false (indicating it was handled locally)
        const wasHandledLocally = onFieldDuplicate(field) === false;
        console.log('Duplication handled locally:', wasHandledLocally);
      } : undefined}
      onDelete={onFieldDelete ? () => {
        console.log('FormField: Trying to delete object:', field.id, 'parent:', field.parentId);
        
        // Call handler and check if it returns false (indicating it was handled locally)
        const wasHandledLocally = onFieldDelete(field) === false;
        console.log('Deletion handled locally:', wasHandledLocally);
      } : undefined}
      onFieldDuplicate={onFieldDuplicate}
      onFieldDelete={onFieldDelete}
      initiallyCollapsed={false} // Start expanded to help with debugging
    />;
  }

  if (field.type === 'array') {
    return <ArrayField
      field={field}
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
      onDuplicate={onFieldDuplicate ? () => {
        console.log('FormField: Trying to duplicate array:', field.id, 'parent:', field.parentId);
        
        // Call handler and check if it returns false (indicating it was handled locally)
        const wasHandledLocally = onFieldDuplicate(field) === false;
        console.log('Array duplication handled locally:', wasHandledLocally);
      } : undefined}
      onDelete={onFieldDelete ? () => {
        console.log('FormField: Trying to delete array:', field.id, 'parent:', field.parentId);
        
        // Call handler and check if it returns false (indicating it was handled locally)
        const wasHandledLocally = onFieldDelete(field) === false;
        console.log('Array deletion handled locally:', wasHandledLocally);
      } : undefined}
      onFieldDuplicate={onFieldDuplicate}
      onFieldDelete={onFieldDelete}
      initiallyCollapsed={false} // Start expanded to help with debugging
    />;
  }

  if (field.type === 'list') {
    return <ListField 
      field={field}
      allowDuplication={!field?.noDuplication}
      allowDeletion={!field?.noDeletion}
      onDuplicate={onFieldDuplicate ? () => onFieldDuplicate(field) : undefined}
      onDelete={onFieldDelete ? () => onFieldDelete(field) : undefined}
    />;
  }

  // Regular fields - pass handlers to field components
  const fieldType = field.type.toLowerCase();
  const props = {
    field,
    onDuplicate: onFieldDuplicate ? () => {
      console.log('FormField: Trying to duplicate basic field:', field.id, 'parent:', field.parentId);
      
      // Check parent context - if this is a child of a container, the container should handle it
      if (field.parentId) {
        const wasHandledLocally = onFieldDuplicate(field) === false;
        console.log('Basic field duplication handled locally:', wasHandledLocally);
      } else {
        // No parent, so this is at the root level
        onFieldDuplicate(field);
      }
    } : undefined,
    onDelete: onFieldDelete ? () => {
      console.log('FormField: Trying to delete basic field:', field.id, 'parent:', field.parentId);
      
      // Check parent context - if this is a child of a container, the container should handle it
      if (field.parentId) {
        const wasHandledLocally = onFieldDelete(field) === false;
        console.log('Basic field deletion handled locally:', wasHandledLocally);
      } else {
        // No parent, so this is at the root level
        onFieldDelete(field);
      }
    } : undefined,
    allowDuplication: !field?.noDuplication,
    allowDeletion: !field?.noDeletion
  };

  switch (fieldType) {
    case 'textarea':
      return <TextArea {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'url':
      return <UrlField {...props} />;
    case 'date':
      return <DateField {...props} />;
    default:
      return <TextField {...props} />;
  }
};
