/**
 * @function cleanMainForm
 * @param {void}
 * @returns {Promise} A promise that resolves after the edit space has been cleaned.
 * @description Provides a smooth transition from a previously loaded file to a new one.
 */

export const cleanMainForm = async () => {
  const editSpace = document.getElementById( 'main-form' );
  if ( !editSpace ) return;

  editSpace.classList.add( 'fade-out' );

  return new Promise( resolve => {
    setTimeout( () => {
      editSpace.remove();
      editSpace.classList.remove( 'fade-out' );
      resolve();
    }, 500 );
  } );
};