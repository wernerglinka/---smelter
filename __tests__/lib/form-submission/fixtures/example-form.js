/**
 * Example DOM structure for form tests
 * Creates a form DOM structure with various types of fields
 */

export const createSimpleForm = () => {
  const form = document.createElement('form');

  // Create a simple text field
  const textDropzone = document.createElement('div');
  textDropzone.className = 'js-dropzone';
  
  const textField = document.createElement('div');
  textField.className = 'form-element';
  
  const textLabelWrapper = document.createElement('label');
  textLabelWrapper.className = 'label-wrapper';
  
  const textLabel = document.createElement('input');
  textLabel.className = 'element-label';
  textLabel.value = 'title';
  
  const textContentWrapper = document.createElement('label');
  textContentWrapper.className = 'content-wrapper';
  
  const textValue = document.createElement('input');
  textValue.className = 'element-value';
  textValue.value = 'Test Page Title';
  
  textLabelWrapper.appendChild(textLabel);
  textContentWrapper.appendChild(textValue);
  textField.appendChild(textLabelWrapper);
  textField.appendChild(textContentWrapper);
  textDropzone.appendChild(textField);
  
  // Create a number field
  const numberField = document.createElement('div');
  numberField.className = 'form-element is-number';
  
  const numberLabelWrapper = document.createElement('label');
  numberLabelWrapper.className = 'label-wrapper';
  
  const numberLabel = document.createElement('input');
  numberLabel.className = 'element-label';
  numberLabel.value = 'order';
  
  const numberContentWrapper = document.createElement('label');
  numberContentWrapper.className = 'content-wrapper';
  
  const numberValue = document.createElement('input');
  numberValue.className = 'element-value';
  numberValue.value = '42';
  
  numberLabelWrapper.appendChild(numberLabel);
  numberContentWrapper.appendChild(numberValue);
  numberField.appendChild(numberLabelWrapper);
  numberField.appendChild(numberContentWrapper);
  textDropzone.appendChild(numberField);
  
  // Boolean field
  const boolField = document.createElement('div');
  boolField.className = 'form-element';
  
  const boolLabelWrapper = document.createElement('label');
  boolLabelWrapper.className = 'label-wrapper';
  
  const boolLabel = document.createElement('input');
  boolLabel.className = 'element-label';
  boolLabel.value = 'draft';
  
  const boolContentWrapper = document.createElement('label');
  boolContentWrapper.className = 'content-wrapper';
  
  const boolValue = document.createElement('input');
  boolValue.className = 'element-value';
  boolValue.type = 'checkbox';
  boolValue.checked = true;
  
  boolLabelWrapper.appendChild(boolLabel);
  boolContentWrapper.appendChild(boolValue);
  boolField.appendChild(boolLabelWrapper);
  boolField.appendChild(boolContentWrapper);
  textDropzone.appendChild(boolField);

  // Add to form
  form.appendChild(textDropzone);
  
  return form;
};

export const createComplexForm = () => {
  const form = document.createElement('form');
  
  // Main dropzone
  const mainDropzone = document.createElement('div');
  mainDropzone.className = 'js-dropzone';
  
  // Simple fields (similar to simple form)
  const titleField = document.createElement('div');
  titleField.className = 'form-element';
  
  const titleLabelWrapper = document.createElement('label');
  titleLabelWrapper.className = 'label-wrapper';
  
  const titleLabel = document.createElement('input');
  titleLabel.className = 'element-label';
  titleLabel.value = 'title';
  
  const titleContentWrapper = document.createElement('label');
  titleContentWrapper.className = 'content-wrapper';
  
  const titleValue = document.createElement('input');
  titleValue.className = 'element-value';
  titleValue.value = 'Complex Test Page';
  
  titleLabelWrapper.appendChild(titleLabel);
  titleContentWrapper.appendChild(titleValue);
  titleField.appendChild(titleLabelWrapper);
  titleField.appendChild(titleContentWrapper);
  mainDropzone.appendChild(titleField);
  
  // Object field
  const metadataField = document.createElement('div');
  metadataField.className = 'form-element is-object';
  
  const metadataName = document.createElement('div');
  metadataName.className = 'object-name';
  
  const metadataNameInput = document.createElement('input');
  metadataNameInput.value = 'metadata';
  metadataName.appendChild(metadataNameInput);
  
  // Object dropzone
  const metadataDropzone = document.createElement('div');
  metadataDropzone.className = 'js-dropzone dropzone';
  
  // Add a description field to metadata
  const descField = document.createElement('div');
  descField.className = 'form-element';
  
  const descLabelWrapper = document.createElement('label');
  descLabelWrapper.className = 'label-wrapper';
  
  const descLabel = document.createElement('input');
  descLabel.className = 'element-label';
  descLabel.value = 'description';
  
  const descContentWrapper = document.createElement('label');
  descContentWrapper.className = 'content-wrapper';
  
  const descValue = document.createElement('input');
  descValue.className = 'element-value';
  descValue.value = 'This is a test page description';
  
  descLabelWrapper.appendChild(descLabel);
  descContentWrapper.appendChild(descValue);
  descField.appendChild(descLabelWrapper);
  descField.appendChild(descContentWrapper);
  metadataDropzone.appendChild(descField);
  
  metadataField.appendChild(metadataName);
  metadataField.appendChild(metadataDropzone);
  mainDropzone.appendChild(metadataField);
  
  // Array field
  const tagsField = document.createElement('div');
  tagsField.className = 'form-element is-array';
  
  const tagsName = document.createElement('div');
  tagsName.className = 'object-name';
  
  const tagsNameInput = document.createElement('input');
  tagsNameInput.value = 'tags';
  tagsName.appendChild(tagsNameInput);
  
  // Array dropzone
  const tagsDropzone = document.createElement('div');
  tagsDropzone.className = 'js-dropzone dropzone array-dropzone';
  
  // Add two tag items
  const tag1Field = document.createElement('div');
  tag1Field.className = 'form-element';
  
  const tag1LabelWrapper = document.createElement('label');
  tag1LabelWrapper.className = 'label-wrapper';
  
  const tag1ContentWrapper = document.createElement('label');
  tag1ContentWrapper.className = 'content-wrapper';
  
  const tag1Value = document.createElement('input');
  tag1Value.className = 'element-value';
  tag1Value.value = 'tag1';
  
  tag1ContentWrapper.appendChild(tag1Value);
  tag1Field.appendChild(tag1LabelWrapper);
  tag1Field.appendChild(tag1ContentWrapper);
  tagsDropzone.appendChild(tag1Field);
  
  const tag2Field = document.createElement('div');
  tag2Field.className = 'form-element';
  
  const tag2LabelWrapper = document.createElement('label');
  tag2LabelWrapper.className = 'label-wrapper';
  
  const tag2ContentWrapper = document.createElement('label');
  tag2ContentWrapper.className = 'content-wrapper';
  
  const tag2Value = document.createElement('input');
  tag2Value.className = 'element-value';
  tag2Value.value = 'tag2';
  
  tag2ContentWrapper.appendChild(tag2Value);
  tag2Field.appendChild(tag2LabelWrapper);
  tag2Field.appendChild(tag2ContentWrapper);
  tagsDropzone.appendChild(tag2Field);
  
  tagsField.appendChild(tagsName);
  tagsField.appendChild(tagsDropzone);
  mainDropzone.appendChild(tagsField);
  
  // List field
  const keywordsField = document.createElement('div');
  keywordsField.className = 'form-element is-list';
  
  const keywordsName = document.createElement('div');
  keywordsName.className = 'object-name';
  
  const keywordsNameInput = document.createElement('input');
  keywordsNameInput.value = 'keywords';
  keywordsName.appendChild(keywordsNameInput);
  
  // List items
  const keywordsList = document.createElement('div');
  keywordsList.className = 'list-container';
  
  const keyword1 = document.createElement('input');
  keyword1.className = 'list-item';
  keyword1.value = 'keyword1';
  
  const keyword2 = document.createElement('input');
  keyword2.className = 'list-item';
  keyword2.value = 'keyword2';
  
  keywordsList.appendChild(keyword1);
  keywordsList.appendChild(keyword2);
  keywordsField.appendChild(keywordsName);
  keywordsField.appendChild(keywordsList);
  mainDropzone.appendChild(keywordsField);
  
  form.appendChild(mainDropzone);
  
  return form;
};

export const createInvalidForm = () => {
  const form = document.createElement('form');
  
  // Invalid number field
  const dropzone = document.createElement('div');
  dropzone.className = 'js-dropzone';
  
  const numberField = document.createElement('div');
  numberField.className = 'form-element is-number';
  
  const numberLabelWrapper = document.createElement('label');
  numberLabelWrapper.className = 'label-wrapper';
  
  const numberLabel = document.createElement('input');
  numberLabel.className = 'element-label';
  numberLabel.value = 'count';
  
  const numberContentWrapper = document.createElement('label');
  numberContentWrapper.className = 'content-wrapper';
  
  const numberValue = document.createElement('input');
  numberValue.className = 'element-value';
  numberValue.value = 'not-a-number';
  
  numberLabelWrapper.appendChild(numberLabel);
  numberContentWrapper.appendChild(numberValue);
  numberField.appendChild(numberLabelWrapper);
  numberField.appendChild(numberContentWrapper);
  dropzone.appendChild(numberField);
  
  form.appendChild(dropzone);
  
  return form;
};

export default {
  createSimpleForm,
  createComplexForm,
  createInvalidForm
};