import { renderSortHandleHTML } from './sort-handle.js';
import { renderDeleteButtonHTML } from './delete-button.js';
import { renderAddButtonHTML } from './add-button.js';
import { renderCollapseButtonsHTML } from './collapse-buttons.js';
import { renderButtonWrapperHTML } from './button-wrapper.js';

// base fields
import { renderField } from './field.js';
import { renderText } from './text.js';
import { renderTextarea } from './textarea.js';
import { renderCheckbox } from './checkbox.js';
import { renderSelect } from './select.js';
import { renderObject } from './object.js';
import { renderList } from './list.js';
import { renderArray } from './array.js';

const renderFunctions = {
  renderSortHandleHTML,
  renderDeleteButtonHTML,
  renderAddButtonHTML,
  renderCollapseButtonsHTML,
  renderButtonWrapperHTML,
  // base fields
  renderField,
  renderText,
  renderTextarea,
  renderCheckbox,
  renderSelect,
  renderObject,
  renderList,
  renderArray
};

export default renderFunctions;
