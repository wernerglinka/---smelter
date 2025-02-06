export const getFlatTemplateList = (obj, parentKey = '') => {
  let result = [];
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      result = result.concat(getFlatTemplateList(item, `${parentKey}[${index}]`));
    });
  } else if (typeof obj === 'object' && obj !== null) {
    for (let key in obj) {
      let fileName;
      if (typeof obj[key] !== 'object' || obj[key] === null) {
        fileName = key.split('/').pop(); // Extracting only the filename
        result.push({ [fileName]: obj[key] });
      } else {
        result = result.concat(getFlatTemplateList(obj[key], fileName));
      }
    }
  }
  return result;
};
