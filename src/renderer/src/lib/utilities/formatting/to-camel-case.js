/**
 * @function toCamelCase
 * @description Convert Title Case to camelCase
 * @param {*} str 
 * @returns 
 */
export function toCamelCase( str ) {
  return str
    .split( ' ' )
    .map( ( word, index ) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt( 0 ).toUpperCase() + word.slice( 1 ).toLowerCase()
    )
    .join( '' );
};