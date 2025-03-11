/**
 * @deprecated Use import { extractFolderName } from '@utils/file/directory' instead
 *
 * This file provides backward compatibility during the transition to the new
 * utilities organization. It re-exports functionality from the new location.
 *
 * @module utilities/get-folder-name
 */

import { extractFolderName } from '@utils/file/directory';

// Re-export with old name for backward compatibility
export default extractFolderName;
