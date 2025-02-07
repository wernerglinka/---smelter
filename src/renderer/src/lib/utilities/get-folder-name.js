const getFolderName = (searchString, path) => {
  if (!path) return '';
  const startIndex = path.indexOf(searchString);
  if (startIndex !== -1) {
    return `/${path.substring(startIndex)}/`;
  }
  return '';
};

export default getFolderName;
