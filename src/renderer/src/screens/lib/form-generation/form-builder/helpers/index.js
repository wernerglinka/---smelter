import { findImplicitDefinition } from './find-implicit-definitions.js';
import { getPlaceholder } from './get-placeholder.js';
import { getLabel } from './get-label.js';
import { getRequiredSup } from './get-required-sup.js';
import { toTitleCase } from './to-title-case.js';
import { toCamelCase } from './to-camel-case.js';

const helpers = {
  findImplicitDefinition,
  getPlaceholder,
  getLabel,
  getRequiredSup,
  toTitleCase,
  toCamelCase
};

export default helpers;
