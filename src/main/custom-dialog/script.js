// Handle content updates
window.electronAPI.onUpdateDialogContent( ( event, { message, logOutput } ) => {
  const messageEl = document.querySelector( '.message' );
  const logEl = document.querySelector( '.log-output' );

  if ( messageEl && message ) {
    messageEl.textContent = message;
  }
  if ( logEl && logOutput ) {
    logEl.textContent = logOutput;
    logEl.scrollTop = logEl.scrollHeight;
  }
} );

// Add auto-scroll to bottom when content updates
const logDiv = document.querySelector( '.log-output' );
if ( logDiv ) {
  const observer = new MutationObserver( () => {
    logDiv.scrollTop = logDiv.scrollHeight;
  } );
  observer.observe( logDiv, { childList: true, characterData: true, subtree: true } );
}

// Handle button clicks
document.querySelectorAll( 'button' ).forEach( ( btn, index ) => {
  btn.addEventListener( 'click', () => {
    const value = document.getElementById( 'inputValue' )?.value;
    window.electronAPI.customResponse( { index, value } );
  } );
} );
