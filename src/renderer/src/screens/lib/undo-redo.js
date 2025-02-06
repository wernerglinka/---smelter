//import { compareDOMElements } from './tools/compare-dom-elements.js';

// TODO: Needs more testing. Seems to work but I'm not sure it's the best way to do this.

/**
 * @function redoUndo
 * @description Add undo and redo buttons to the dropzone
 * @returns
 */
export const redoUndo = () => {
  // create wrapper div for redo, undo and snapshot buttons
  const wrapper = document.createElement('div');
  wrapper.id = 'undo-redo-wrapper';
  // create undo button
  const undoButton = document.createElement('button');
  undoButton.classList.add('undo', 'btn');
  undoButton.setAttribute('title', 'Undo');
  undoButton.disabled = true;
  undoButton.innerHTML = `
    <svg viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <polyline id="Path" points="0 0 0 6 6 6"></polyline>
            <path d="M18,10 C18,5.02943725 13.9705627,1 9,1 C6.78512226,1.00225545 4.64885314,1.82115862 3,3.3 L0,6" id="Path"></path>
          </g>
        </g>
      </g>
  </svg>
  `;
  wrapper.appendChild(undoButton);

  // create redo button
  const redoButton = document.createElement('button');
  redoButton.classList.add('redo', 'btn');
  redoButton.setAttribute('title', 'Redo');
  redoButton.disabled = true;
  redoButton.innerHTML = `
    <svg viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <polyline id="Path" points="18 0 18 6 12 6"></polyline>
            <path d="M0,10 C0,5.02943725 4.02943725,1 9,1 C11.2148777,1.00225545 13.3511469,1.82115862 15,3.3 L18,6" id="Path"></path>
          </g>
        </g>
      </g>
    </svg>
  `;
  wrapper.appendChild(redoButton);

  // create snapshot button
  const snapshotButton = document.createElement('button');
  snapshotButton.classList.add('snapshot', 'btn');
  //snapshotButton.disabled = true;
  snapshotButton.setAttribute('title', 'Take a snapshot of the current state');
  snapshotButton.innerHTML = `
    <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <path d="M12.5,0 L7.5,0 L5,3 L2,3 C0.8954305,3 0,3.8954305 0,5 L0,14 C0,15.1045695 0.8954305,16 2,16 L18,16 C19.1045695,16 20,15.1045695 20,14 L20,5 C20,3.8954305 19.1045695,3 18,3 L15,3 L12.5,0 Z"></path>
            <circle cx="10" cy="9" r="3"></circle>
          </g>
        </g>
      </g>
    </svg>
  `;
  wrapper.appendChild(snapshotButton);

  // Create element for stack length
  const stackLength = document.createElement('div');
  stackLength.id = 'stack-length';
  stackLength.classList.add('undo-redo-count');
  wrapper.appendChild(stackLength);

  // Create element for snapshot message
  const snapshotMessage = document.createElement('div');
  snapshotMessage.id = 'snapshot-message';
  snapshotMessage.classList.add('undo-redo-message');
  wrapper.prepend(snapshotMessage);

  /**
   * Provide undo and redo functionality for the dropzone
   * The undo/redo functions act on snapshots of the dropzone.
   * Taking a snapshot is up to the user. When the user clicks the snapshot button
   * we clone the dropzone and push the clone onto the undo stack.
   */
  let undoStack = [];
  let redoStack = [];

  // Push initial state onto the undo stack
  let dropzone = document.getElementById('dropzone');
  let clone = dropzone.cloneNode(true);
  // Push the clone onto the stack
  undoStack.push(clone);
  // Update stack length display
  stackLength.innerHTML = undoStack.length - 1;

  // Add event listeners to the buttons. Delegate to the wrapper
  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dropzone = document.getElementById('dropzone');
    const mainForm = document.getElementById('main-form');

    const target = e.target;
    if (target.closest('.undo')) {
      // UNDO
      if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        mainForm.replaceChild(undoStack[undoStack.length - 1], dropzone);
      }
    } else if (target.closest('.redo')) {
      // REDO
      if (redoStack.length > 0) {
        undoStack.push(redoStack.pop());
        mainForm.replaceChild(undoStack[undoStack.length - 1], dropzone);
      }
    } else if (target.closest('.snapshot')) {
      // SNAPSHOT
      // Clone the current state of the dropzone. We clone so we capture
      // the event listeners as well as the HTML
      const thisClone = document.getElementById('dropzone').cloneNode(true);
      // Push the clone onto the stack
      undoStack.push(thisClone);
      // Clear the redo stack
      redoStack = [];
    }

    // Update stack length display
    stackLength.innerHTML = undoStack.length - 1;

    // enable the undo button if there is something on the stack
    if (undoStack.length > 1) {
      undoButton.disabled = false;
    } else {
      undoButton.disabled = true;
    }

    // disable the redo button if there is nothing on the stack
    if (redoStack.length === 0) {
      redoButton.disabled = true;
    } else {
      redoButton.disabled = false;
    }
  });
  return wrapper;
};
