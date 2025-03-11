# Form Validation System

## Overview

The Smelter application features a standardized validation system for form fields, providing consistent error handling, feedback, and validation rules. This document explains how to use the validation system in your components and forms.

## Components & Hooks

The validation system consists of the following parts:

1. **`ValidationContext`** - Core context for managing validation state and rules
2. **`FormField`** - Wrapper component for standardized field rendering and feedback
3. **`ValidationFeedback`** - Component for displaying error messages
4. **`FormErrorSummary`** - Component for showing all validation errors in one place
5. **`useFormValidation`** - Hook for working with form validation

## Usage Examples

### Basic Field Validation

```jsx
import { FormField } from '@components/FormField';
import { useValidation } from '@hooks';

function MyForm() {
  const { validate } = useValidation();
  
  const handleBlur = (e) => {
    validate('username', e.target.value, {
      required: true,
      minLength: 3
    });
  };
  
  return (
    <form>
      <FormField 
        name="username" 
        label="Username" 
        required
        helpText="Enter at least 3 characters"
      >
        <input
          type="text"
          name="username"
          onBlur={handleBlur}
        />
      </FormField>
      
      {/* Other fields */}
    </form>
  );
}
```

### Complete Form Validation

```jsx
import { useState } from 'react';
import { FormField } from '@components/FormField';
import { FormErrorSummary } from '@components/FormErrorSummary';
import { useFormValidation } from '@hooks';

function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  // Define validation rules
  const validationRules = {
    username: {
      required: true,
      minLength: 3,
      pattern: /^[a-zA-Z0-9_]+$/
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 8
    }
  };
  
  // Initialize form validation
  const { 
    validateField, 
    validateAllFields, 
    errors 
  } = useFormValidation({
    validationRules,
    onValidationSuccess: (data) => {
      console.log('Form is valid, submitting', data);
      // Handle submission
    }
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateAllFields()) {
      // Form is valid - submission handled by onValidationSuccess
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormErrorSummary />
      
      <FormField name="username" label="Username" required>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>
      
      <FormField name="email" label="Email" required>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>
      
      <FormField name="password" label="Password" required>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </FormField>
      
      <button type="submit">Register</button>
    </form>
  );
}
```

## Available Validation Rules

The validation system supports these built-in validation rules:

- **`required`**: Field must have a value
- **`minLength`**: String must be at least N characters
- **`maxLength`**: String must not exceed N characters
- **`pattern`**: String must match a regular expression
- **`email`**: Value must be a valid email
- **`url`**: Value must be a valid URL
- **`custom`**: Custom validation function

### Example Rules Object

```javascript
const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  email: {
    required: true,
    email: true
  },
  age: {
    custom: (value) => {
      if (value < 18) return 'You must be at least 18 years old';
      if (value > 120) return 'Please enter a valid age';
      return true;
    }
  }
};
```

## Integration with Form Operations

The validation system is fully integrated with the Form Operations Context. This means that validation can be performed:

1. **On Field Blur**: When a user leaves a field
2. **On Form Submission**: Validating all fields at once
3. **Programmatically**: Trigger validation at any time

## Adding Custom Validators

You can extend the validation system with custom validators by adding them to the `utils/validation/form.js` file:

```javascript
// In utils/validation/form.js
export const isValidPhone = (value) => {
  if (!isString(value)) return false;
  // Basic US phone validation
  return /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(value);
};
```

Then use them in your validation rules:

```javascript
const validationRules = {
  phone: {
    required: true,
    isValidPhone: true
  }
};
```