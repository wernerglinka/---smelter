/**
 * @deprecated Use import { selectProject, validateDialogResult, validatePath } from '@utils/services/project' instead
 *
 * This file provides backward compatibility during the transition to the new
 * utilities organization. It re-exports functionality from the new location.
 *
 * @module utilities/select-project
 */

import { selectProject, validateDialogResult, validatePath } from '@utils/services/project';

export { selectProject, validateDialogResult, validatePath };
