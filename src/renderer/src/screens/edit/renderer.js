/**
 * Edit Project screen renderer
 * Handles initialization and setup of:
 * - Project name display
 * - Sidebar functionality
 * - Template management
 * - Edit space rendering
 * - Preview pane
 */

// Event handler imports
import { dragStart } from "../lib/page-elements/event-handlers.js";

// Section manager imports
import manageSidebarVisibility from './sections/manage-sidebar-visibility.js';
import updateProjectName from './sections/update-project-name.js';
import manageSidebar from './sections/manage-sidebar.js';
import buildTemplatesSelection from './sections/build-templates-selection.js';
import renderEditSpace from "./sections/render-edit-space.js";
import managePreview from "./sections/manage-preview.js";

/**
 * Initialize screen components in sequence:
 */

// 1. Update project name in top left corner
const projectPath = updateProjectName();

// 2. Initialize sidebar visibility toggle
manageSidebarVisibility();

// 3. Set up sidebar with drag-drop functionality
//    dragStart handler enables dragging components from sidebar
manageSidebar( dragStart );

// 4. Build template selection interface in sidebar
//    Allows selecting pre-defined page templates
buildTemplatesSelection();

// 5. Initialize main edit space
//    Sets up file tree and form rendering
renderEditSpace( projectPath );

// 6. Set up preview pane functionality
//    Handles YAML preview toggle and updates
managePreview();