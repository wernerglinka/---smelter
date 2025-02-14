# Sidebar Component

## Overview
The Sidebar component is a core navigation and content management interface that provides three main functionalities:
1. File/folder navigation and management
2. Field addition through drag-and-drop
3. Template management (planned feature)

## Architecture

### Component Structure
```
Sidebar/
├── index.jsx               # Main component
├── ContentFilesTree.jsx    # Handles markdown content files
├── DataFilesTree.jsx       # Handles JSON data files
├── FileTree.jsx            # Base tree component
├── styles.css              # Component styles
├── hooks/                  # Custom hooks
│   ├── useCreateFile.js
│   └── useCreateFolder.js
├── click-handlers/         # Event handlers
│   ├── index.js
│   ├── handleNewFileClick.js
│   ├── handleNewFolderClick.js
│   ├── handleFileDelete.js
│   └── handleFolderDelete.js
└── help/                   # Help text content
    └── project-files.js
```

### Key Components

#### Main Sidebar (`index.jsx`)
- Manages the overall state and layout
- Handles pane switching (file selection, field addition, templates)
- Coordinates between file trees and creation controls

#### File Trees
- `ContentFilesTree`: Manages markdown (.md) files for content
- `DataFilesTree`: Manages JSON files for data
- `FileTree`: Base component providing common tree functionality

#### Click Handlers
The `click-handlers` directory contains isolated event handlers for file and folder operations:

1. **Creation Handlers**
   - `handleNewFileClick.js`: Creates new files with appropriate extensions
   - `handleNewFolderClick.js`: Creates new folders in the selected directory

2. **Deletion Handlers**
   - `handleFileDelete.js`: Handles file deletion with user confirmation
   - `handleFolderDelete.js`: Handles folder deletion with user confirmation and cleanup

Each handler:
- Implements proper error handling
- Shows confirmation dialogs
- Dispatches appropriate events for UI updates
- Handles path resolution (relative vs absolute)

### State Management

The component manages several key states:
- `activePane`: Current active sidebar pane
- `fileSelected`: Currently selected file
- `openFolders`: Set of expanded folders
- `activeFolder`: Currently active folder for new file/folder creation
- `activeFileExtension`: Current file extension based on folder context

### Event System

The component uses a custom event system for file/folder operations:

1. **Creation Events**
   - `fileCreated`: Triggered when a new file is created
   - `folderCreated`: Triggered when a new folder is created

2. **Deletion Events**
   - `fileDeleted`: Triggered when a file is deleted
   - `folderDeleted`: Triggered when a folder is deleted

These events are used to:
- Update the file tree display
- Maintain UI consistency
- Trigger necessary cleanup operations

### User Interactions

#### File Management
1. **File Selection**
   - Click file to select
   - Selected file enables field addition functionality

2. **Folder Operations**
   - COMMAND + Click: Activate folder for new file/folder creation
   - Click folder arrow: Expand/collapse folder
   - Delete: Remove folder and all contents with confirmation

3. **Creation Controls**
   - New Folder: Creates folder in active directory
   - New File: Creates file with appropriate extension (.md/.json)

4. **Deletion Controls**
   - Delete File: Removes file with confirmation
   - Delete Folder: Removes folder and contents with confirmation

#### Field Addition
- Drag-and-drop interface for adding new fields
- Only enabled when a file is selected
- Fields are defined in `baseFields`

## Usage

```jsx
import Sidebar from './components/Sidebar';

// Example usage of the Sidebar component
function ExampleEditorImplementation() {
  const handleFileSelect = (filepath) => {
    // Handle file selection
  };

  const handleFileDelete = (filepath) => {
    // Handle file deletion
  };

  return (
    <Sidebar
      path="/project/root"
      onFileSelect={handleFileSelect}
      onFileDelete={handleFileDelete}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| path | string | Yes | Root path of the project |
| className | string | No | Additional CSS classes |
| onFileSelect | function | Yes | Callback when file is selected |
| onFileDelete | function | Yes | Callback when file is deleted |

## Help System

The component includes a built-in help system that provides contextual information:
- Project files help text explains file/folder operations
- Hover states indicate available actions
- Disabled states prevent invalid operations

## File Type Handling

The component automatically handles different file types:
- Content files (.md) in the content directory
- Data files (.json) in the data directory
- File extension is automatically set based on the active folder

## Styling

The component uses a modular CSS approach:
- Base styles in `styles.css`
- BEM-like naming convention
- Responsive design considerations
- Theme-aware styling

## Future Enhancements

1. Template System Implementation
   - Drag-and-drop template insertion
   - Template management interface
   - Custom template creation

2. Planned Features
   - File preview
   - Multi-select operations
   - Search functionality
   - Filter by file type

## Contributing

When modifying this component:
1. Maintain the existing architecture
2. Document all new props and state
3. Update this README for significant changes
4. Follow the established naming conventions
5. Add appropriate JSDoc comments
