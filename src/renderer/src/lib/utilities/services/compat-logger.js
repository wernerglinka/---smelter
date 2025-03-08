/**
 * Compatibility layer for logger utility
 * 
 * This file provides backward compatibility while transitioning to the new
 * utility structure. It re-exports the logger from the new location.
 * 
 * @deprecated Use import { logger } from 'utils/services/logger' instead
 */

import { logger } from '../../../../../utils/services/logger';

// Re-export logger from new location
export { logger };