/**
 * @deprecated Use import { ... } from '@utils/validation/types' instead
 * 
 * This file provides backward compatibility during the transition to the new
 * utilities organization. It re-exports functionality from the new location.
 * 
 * @module utils/type-validators
 * @description Validation utilities for checking data types and structures
 */

import {
  isSimpleList,
  isDateObject,
  isValidDate,
  isComplexObject,
  getFieldType,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isArray,
  isObject,
  isNull,
  isUndefined,
  isEmpty
} from '@utils/validation/types';

export {
  isSimpleList,
  isDateObject,
  isValidDate,
  isComplexObject,
  getFieldType,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isArray,
  isObject,
  isNull,
  isUndefined,
  isEmpty
};
