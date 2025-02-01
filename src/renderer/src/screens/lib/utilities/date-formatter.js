// screens/lib/utilities/date-formatter.js

/**
 * @module date-formatter
 * @description Date formatting utilities
 */

/**
 * Formats date string to yyyy-MM-dd
 * @param {string} inputDateString - Input date string
 * @returns {string} Formatted date or "Invalid Date"
 */

/*
export const formatDate = ( inputDateString ) => {
  if ( inputDateString == null ) return "Invalid Date";

  const inputDate = new Date( inputDateString );
  if ( isNaN( inputDate.getTime() ) ) return "Invalid Date";

  const year = inputDate.getFullYear();
  const month = String( inputDate.getMonth() + 1 ).padStart( 2, "0" );
  const day = String( inputDate.getDate() ).padStart( 2, "0" );

  return `${ year }-${ month }-${ day }`;
};
*/

// screens/lib/utilities/date-formatter.js
export const formatDate = ( inputDateString ) => {
  if ( inputDateString == null ) return "Invalid Date";

  // Try parsing yyyy-MM-dd format directly
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec( inputDateString );
  if ( match ) {
    const year = parseInt( match[ 1 ], 10 );
    const month = parseInt( match[ 2 ], 10 );
    const day = parseInt( match[ 3 ], 10 );

    // Validate month and day
    if ( month < 1 || month > 12 ) return "Invalid Date";
    if ( day < 1 || day > 31 ) return "Invalid Date";

    return `${ year }-${ String( month ).padStart( 2, "0" ) }-${ String( day ).padStart( 2, "0" ) }`;
  }

  // If not matching our expected format, try Date parsing
  const inputDate = new Date( inputDateString );
  if ( isNaN( inputDate.getTime() ) ) return "Invalid Date";

  const year = inputDate.getUTCFullYear();
  const month = String( inputDate.getUTCMonth() + 1 ).padStart( 2, "0" );
  const day = String( inputDate.getUTCDate() ).padStart( 2, "0" );

  return `${ year }-${ month }-${ day }`;
};