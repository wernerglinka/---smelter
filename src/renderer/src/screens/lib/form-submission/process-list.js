/**
 * @function processList
 * @param {*} listElement 
 * @returns key/value pair
 * @description Transforms a list element to a key/value pair, were the key is the
 *   list name and the value is an array of the list items
 */
export const processList = ( listElement ) => {
  // get the list name
  const key = listElement.querySelector( '.object-name input' )
    ? listElement.querySelector( '.object-name input' ).value
    : listElement.querySelector( '.object-name .label-text' ).textContent;
  // get the list
  const listItems = listElement.querySelectorAll( 'li' );
  const listItemsArray = [];
  listItems.forEach( ( item, index ) => {
    listItemsArray.push( item.querySelector( 'input' ).value );
  } );
  const value = listItemsArray;

  return { key, value };
};