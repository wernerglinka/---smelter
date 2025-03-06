/**
 * Handlers for content processing in the EditSpace component
 */
// Import dynamically in the processContent function instead

/**
 * Process file content (frontmatter and markdown)
 * 
 * @param {Object} fileContent - File content object 
 * @param {Function} setFormFields - Form fields state setter
 * @param {Function} setActiveFilePath - Active file path setter
 * @param {Function} setFileName - File name setter
 * @param {Function} setHistory - History setter
 * @param {Function} setHistoryPosition - History position setter
 * @param {Function} setRedoLevel - Redo level setter
 * @param {Function} setSnapshots - Snapshots setter
 */
export const processContent = async (
  fileContent,
  setFormFields,
  setActiveFilePath,
  setFileName,
  setHistory,
  setHistoryPosition,
  setRedoLevel,
  setSnapshots
) => {
  if (fileContent?.data?.frontmatter) {
    try {
      // Dynamically import to avoid circular dependencies
      const { processFrontmatter } = await import('@lib/form-generation/processors/frontmatter-processor');
      
      // Determine if we should add contents field based on content existence
      const hasContent = fileContent.data.content && fileContent.data.content.trim().length > 0;
      const hasFrontmatter = Object.keys(fileContent.data.frontmatter).length > 0;
      
      // Only add contents field if there is actual content or if frontmatter is present
      const processedData = await processFrontmatter(
        fileContent.data.frontmatter,
        fileContent.data.content || '', // Ensure we always pass at least an empty string for content
        { addContentsField: hasContent || hasFrontmatter }
      );
      
      // Clear previous form fields first to prevent persistence between files
      setFormFields(null);
      // Reset history when loading a new file
      setHistory([]);
      setHistoryPosition(-1);
      setRedoLevel(0);
      setSnapshots([]);
      
      // Then set the new fields after a short delay
      setTimeout(() => {
        setFormFields(processedData.fields);
        setActiveFilePath(fileContent.path);
        setFileName(fileContent.path.split('/').pop());
        
        // Initialize history with the first state - but don't use addToHistory
        // to avoid potential dependency issues
        setHistory([JSON.stringify(processedData.fields)]);
        setHistoryPosition(0);
        setRedoLevel(0);
      }, 10);
    } catch (error) {
      console.error('Error processing content:', error);
    }
  } else {
    // Reset form fields when no content is loaded
    setFormFields(null);
    setActiveFilePath(null);
    setFileName(null);
    // Reset history
    setHistory([]);
    setHistoryPosition(-1);
    setRedoLevel(0);
    setSnapshots([]);
  }
};