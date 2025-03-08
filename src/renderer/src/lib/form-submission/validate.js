/**
 * @deprecated Use import { isValidLabel, validateField, validateFormData, validateSubmission } from '@utils/validation/form' instead
 * 
 * This file provides backward compatibility during the transition to the new
 * utilities organization. It re-exports functionality from the new location.
 * 
 * @module form-submission/validate
 */

import { 
  isValidLabel, 
  validateField,
  validateFormData,
  validateSubmission 
} from '@utils/validation/form';

export { 
  isValidLabel,
  validateSubmission
};
