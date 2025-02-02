# Edit Project Flow

## Open the App
The main App screen will be shown.
![App Entry screen](../images/app-entry-screen.png)

## Click the Open A Project link 
A modal to select a project folder will be shown.

## Select a project folder and click the _Select Project Folder_ button.
For Metallurgy to be able to work with any Metalsmith site, the site must have a hidden `.metallurgy` folder in its project root. The folder must have a `projectData.json`. This file contains the path of the project’s content and data folders. Optionally, it may contain a `schema` folder with schema files describing individual parts of a page.

This will load the project into the app.

![Project Edit screen](../images/project-edit-screen.png)

## The Project Edit Screen
The initial project edit screen features a left sidebar and the empty main editing pane.

In the upper right cormer of the screen, there there is a "Start Over" link. Clicking this link will return you to the App Entry screen and you can start anew.

Top of the left sidebar, there are four buttons to selection the edit options:

**Select File** - This is the default option. It allows you to select a file from the project to edit. Either a markdown file or a metadata file. The files are listed in the lower part of the sidebar.

**Build a New Page** - This option will allow you to build a new page from scratch. It will open a new markdown file in the main editing pane. The file will be saved in the project folder when the Save button is clicked.

**Add Field** - The option will change the lower part of the sidebar to a list of predefined fields that can be added to the markdown file. A field can be added by dragging it to the main editing pane and dropping it into the desired location.

**Add Template** - The option will change the lower part of the sidebar to a list of predefined templates that can be added to the markdown file. A template can be added by dragging it to the main editing pane and dropping it into the desired location.

## Editing a File
When a file is selected, the file content will be shown in the main editing pane. The file is presented as a form with each field in the file being shown as a separate editable form field. Fields in this form can be move to different positions, edited or deleted. New fields are added by selecting the Add Field option from the left sidebar and then dragging a field to the desired location in the form. The same is true for adding a template.

## Saving Changes
When changes are made to the file, the Save button will be enabled. Clicking the Save button will save the changes to the file.

## A step-by-step flow of the project editing process.

### App Entry Screen
Starting with the App Entry screen, the flow is as follows:

We are on the App Entry screen and the user clicks the `Open A Project` link.
`handleOpenProject()` calles `getProjectFromDialog()`. A dialog is presented prompting the user to select a project folder. 

The user selects a project folder and clicks the `Select Project Folder` button.

`getProjectFromDialog()` calls `selectProject()` which returns a promise. The promise is resolved with the selected project folder path.

It then check if the project folder has a `.metallurgy` folder. If it does not, it will show an "Invalid Project" error message and return to the App Entry screen.

If the project folder has a `.metallurgy` folder, it will return the project folder path.

Next the project folder path is passed to `setupProjectConfig()` which reads the project data from the `.metallurgy/projectData.json` file in the selected project folder. The project data is loaded into localStorage via `StorageOperations`.

Then the screen is changed to the Project Edit screen.

### Project Edit Screen

The renderer for the Edit Project screen  first adds the name of the project to the upper left corner of the screen with `updateProjectName()`.

Then it initiallizes the sidebar functionality with `manageSidebarVisibility()`. The sidebar has four buttons: Select File, Build New Page, Add Field, Add Template. The default is Select File.

The Select File button is clicked and the files in the project are listed in the lower part of the sidebar.

#### In `render-edit-space.js`

`loadDirectoryFiles()` is called to get the content of the `contentFolder` and the `dataFolder` from the project data. The files are listed in the sidebar in a file tree structure.

Clicking on any of the files will load the file content into the main editing pane.

`handleFileSelection()` will call `setupEditForm()` and then `handleFileContent()`. `HandleFileContent()` will check for file type, either markdown or JSON, and then call `renderMarkdownFile()` or `setupJSONFile()` respectively.

Then the form is rendered with each field in the file being shown as a separate editable form field.

The user can edit the form fields, move them to different positions, add new fields, or delete fields.

When changes are made to the file, the Save button will be enabled. Clicking the Save button will save the changes to the file.

This was setup in `setupFormSubmission()`. Once the submit button is clicked the form will be send to the project folder overwriting the original file.





