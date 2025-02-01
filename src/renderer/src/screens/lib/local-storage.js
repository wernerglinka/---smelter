// Utility function to handle localStorage
export const saveToLocalStorage = ( key, value ) => {
  try {
    localStorage.setItem( key, value );
  } catch ( e ) {
    console.error( "Error saving to localStorage", e );
  };
};

export const getFromLocalStorage = ( key ) => {
  try {
    return localStorage.getItem( key );
  } catch ( e ) {
    console.error( "Error getting from localStorage", e );
  };
};

export const deleteFromLocalStorage = ( key ) => {
  try {
    localStorage.removeItem( key );
  } catch ( e ) {
    console.error( "Error deleting from localStorage", e );
  };
};