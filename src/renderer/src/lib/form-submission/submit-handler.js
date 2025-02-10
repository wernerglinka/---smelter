export const handleFormSubmission = async (formData, filePath) => {
  try {
    const processedData = transformFormDataToObject(formData);
    await validateSubmission(processedData);
    await handleFileOperations(processedData, filePath);
    return { success: true };
  } catch (error) {
    console.error('Form submission error:', error);
    return { success: false, error };
  }
};

const transformFormDataToObject = (formData) => {
  const result = {};

  // Group entries by their path structure
  for (const [key, value] of formData.entries()) {
    const path = key.split('.');
    setNestedValue(result, path, value);
  }

  return result;
};

const setNestedValue = (obj, path, value) => {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current)) {
      // Handle array indices
      current[key] = /^\d+$/.test(path[i + 1]) ? [] : {};
    }
    current = current[key];
  }

  current[path[path.length - 1]] = value;
};
