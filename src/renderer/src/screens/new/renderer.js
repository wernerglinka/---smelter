import { getFromLocalStorage, saveToLocalStorage } from "../lib/local-storage.js";
import { StorageOperations } from '../lib/storage-operations.js';
import { isProjectReady } from "../lib/utilities/is-project-ready.js";
import { selectFolder } from "../lib/select-folder.js";
import { updateFolderUI } from "../lib/update-folder-ui.js";
import { updateButtonsContainer } from "../lib/update-buttons-container.js";

const renderer = ( () => {
  const showProjectFolderName = async () => {

    // Get the project folder path from local storage
    const projectFolder = StorageOperations.getProjectPath();
    StorageOperations.clearProjectData();

    //update project folder name in the UI
    const projectFolderName = document.querySelector( '.js-project-folder-name' );
    if ( projectFolderName ) {
      const folderName = `/${ projectFolder.split( "/" ).pop() }/`;
      projectFolderName.innerText = folderName;
    }

    let projectAlreadyExists;

    try {
      // Check if a config file already exists in this project folder
      // <projectFolder>/.metallurgy/projectData.json
      const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;
      const response = await window.electronAPI.files.exists( configFilePath );

      if ( response.status === 'failure' ) {
        throw new Error( response.error );
      }

      // If the config file exists, show the content and data folders in the UI
      if ( response.data ) {
        // Get the content and data folder from the config file
        const fileContents = await window.electronAPI.files.read( configFilePath );

        const { projectPath, contentPath, dataPath } = fileContents.data;

        StorageOperations.saveProjectData( {
          projectPath,
          contentPath,
          dataPath
        } );

        // Update the UI with the content and data folder names and hide the
        // 'select content folder' and 'select data folder' buttons
        updateFolderUI( 'content', contentPath );
        updateFolderUI( 'data', dataPath );

        // Check if the project is ready to be created
        if ( isProjectReady() ) {
          updateButtonsContainer();
        }

        // Add note to the UI that the project already exists and ask if the
        // user wants to continue
        const startNew = document.querySelector( '.js-start-new' );
        const startWithConfig = document.querySelector( '.js-start-with-config' );

        startNew.style.display = "none";
        startWithConfig.style.display = "block";

        projectAlreadyExists = true;
      } else {
        StorageOperations.saveProjectPath( projectFolder );
        projectAlreadyExists = false;
      }

      return projectAlreadyExists;

    } catch ( error ) {
      console.error( 'Error checking project config:', error );
    }
  };


  const getContentFolder = () => {
    const trigger = document.querySelector( '.js-get-content-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // Get the content folder from the user via a dialog box
          const userSelection = await selectFolder( "Content" );

          if ( userSelection.length === 0 ) return false;

          // Save the content folder to local storage
          const contentFolder = userSelection[ 0 ];
          StorageOperations.saveContentPath( contentFolder );

          // Update the UI with the content folder name and hide the 'select 
          // content folder' button
          updateFolderUI( 'content', contentFolder );

          // Check if the project is ready to be created
          if ( isProjectReady() ) {
            updateButtonsContainer();
          }

        } catch ( error ) {
          console.error( "Error in getContentFolder", error );
          await window.electronAPI.dialog.showCustomMessage( {
            type: 'error',
            message: `Error selecting content folder`,
            buttons: [ 'OK' ]
          } );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getProjectFolder" );
      return false;
    }
  };

  const getDataFolder = () => {
    const trigger = document.querySelector( '.js-get-data-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // Get the content folder from the user via a dialog box
          const userSelection = await selectFolder( "Data" );
          if ( userSelection.length === 0 ) return false;

          // Save the data folder to local storage
          const dataFolder = userSelection[ 0 ];
          StorageOperations.saveDataPath( dataFolder );

          // update the UI with the content folder name and hide the 'select 
          // content folder' button
          updateFolderUI( 'data', dataFolder );

          // Check if the project is ready to be created
          if ( isProjectReady() ) {
            updateButtonsContainer();
          }
        } catch ( error ) {
          console.error( "Error in getDataFolder", error );
          await window.electronAPI.dialog.showCustomMessage( {
            type: 'error',
            message: `Error selecting data folder`,
            buttons: [ 'OK' ]
          } );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getDataFolder" );
      return false;
    }
  };

  const storeProjectConfig = () => {
    const trigger = document.querySelector( '.js-start' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Get the target and home screen
        const targetScreen = e.target.href;
        const homeScreen = document.location.href;

        // Create the project config file
        const projectData = StorageOperations.getProjectData();

        // Construct the path to the project config file
        const configFilePath = `${ projectData.projectPath }/.metallurgy/projectData.json`;

        // Construct the data object to be sent to the main process
        const data = {
          obj: projectData,
          path: configFilePath
        };

        // Send the project data to the main process to create the project config file
        const response = await electronAPI.files.write( data );

        if ( response.status === "success" ) {
          // Redirect to open project screen
          window.location.href = targetScreen;
        } else {
          console.error( `Error creating project config file`, response.error );
          window.location.href = homeScreen;
        }
      } );
    }
  };

  const init = async () => {
    const exists = await showProjectFolderName();
    if ( !exists ) {
      getContentFolder();
      getDataFolder();
      storeProjectConfig();
    }
  };

  return { init };

} )();

renderer.init();