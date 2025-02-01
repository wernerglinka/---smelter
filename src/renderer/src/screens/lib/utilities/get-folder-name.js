/**
 * @function getFolderName
 * @param {*} searchString - path of the project folder
 * @param {*} path - full path to a file or folder
 * @returns a new path with searchString as the root folder
 * @description This function generates paths for displaying to the user.
 */
const getFolderName = ( searchString, path ) => {
  if ( !path ) return "";
  const startIndex = path.indexOf( searchString );
  if ( startIndex !== -1 ) {
    return `/${ path.substring( startIndex ) }/`;
  }
  return "";
};

export default getFolderName;