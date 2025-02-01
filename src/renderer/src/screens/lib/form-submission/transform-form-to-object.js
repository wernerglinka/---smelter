import { toCamelCase } from '../form-generation/form-builder/helpers/to-camel-case.js';

/** @module FormTransformation to JS Object */

/**
 * Operations for extracting and formatting values from form elements
 * @namespace ValueOps
 */
export const ValueOps = {
  /**
   * @function getName
   * Extracts name from element, converts to camelCase
   * @param {HTMLElement} element - Form element
   * @returns {string} Cleaned, camelCased name
   */
  getName: element => {
    const input = element.querySelector( '.object-name input' );
    const text = element.querySelector( '.label-text' );
    if ( !input && !text ) return '';

    const rawName = ( input ? input.value : text.textContent ).trim();
    return toCamelCase( rawName );
  },

  /**
   * @function getKeyValue
   * Extracts key-value pair from form element
   * @param {HTMLElement} element - Form element
   * @returns {{key: string, value: string|number|boolean}} Key-value pair
   */
  getKeyValue: element => {
    const labelInput = element.querySelector( '.element-label' );
    const valueInput = element.querySelector( '.element-value' );
    const key = labelInput ? toCamelCase( labelInput.value ) : '';

    let value = '';
    if ( valueInput ) {
      value = valueInput.type === 'checkbox' ? valueInput.checked :
        valueInput.type === 'number' ? Number( valueInput.value ) :
          valueInput.value.trim();
    }

    return { key, value };
  }
};

/**
 * Operations for managing object paths
 * @namespace PathOps
 */
export const PathOps = {
  /**
   * @function push
   * Adds name to path array
   * @param {string[]} path - Current path array
   * @param {string} name - Name to append
   * @returns {string[]} New path array
   */
  push: ( path, name ) => [ ...path, name ],

  /**
   * @function pop
   * Removes last element from path
   * @param {string[]} path - Current path array
   * @returns {string[]} Shortened path array
   */
  pop: path => path.slice( 0, -1 ),

  /**
   * @function getIn
   * Gets nested object value at path
   * @param {Object} obj - Source object
   * @param {string[]} path - Path to traverse
   * @returns {Object} Nested object
   */
  getIn: ( obj, path ) => {
    return path.reduce( ( current, key ) => {
      current[ key ] = current[ key ] || {};
      return current[ key ];
    }, obj );
  },

  /**
   * @function setIn
   * Sets value at nested path
   * @param {Object} obj - Source object
   * @param {string[]} path - Path to set
   * @param {*} value - Value to set
   * @returns {Object} Updated object
   */
  setIn: ( obj, path, value ) => {
    if ( path.length === 0 ) return value;
    const [ head, ...rest ] = path;
    return {
      ...obj,
      [ head ]: PathOps.setIn( obj[ head ] || {}, rest, value )
    };
  }
};

/**
 * Operations for managing form state
 * @namespace FormStateOps
 */
export const FormStateOps = {
  /**
   * @function createState
   * Creates initial form state
   * @returns {{path: string[], result: Object}} Initial state
   */
  createState: () => ( {
    path: [ 'main' ],
    result: { main: {} }
  } ),

  /**
   * @function handleStructural
   * Handles structural elements by updating path
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleStructural: ( state, element ) => {
    const name = ValueOps.getName( element );
    return {
      ...state,
      path: PathOps.push( state.path, name )
    };
  },

  /**
   * @function handleValue
   * Handles value elements and lists
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleValue: ( state, element ) => {
    if ( element.classList.contains( 'is-list' ) ) {
      const name = ValueOps.getName( element );
      const items = Array.from( element.querySelectorAll( '.list-item' ) )
        .map( input => input.value.trim() );
      const currentValue = PathOps.getIn( state.result, state.path );
      return {
        ...state,
        result: PathOps.setIn(
          state.result,
          state.path,
          { ...currentValue, [ name ]: items }
        )
      };
    }

    const { key, value } = ValueOps.getKeyValue( element );
    if ( !key ) return state;
    return {
      ...state,
      result: PathOps.setIn(
        state.result,
        state.path,
        { ...PathOps.getIn( state.result, state.path ), [ key ]: value }
      )
    };
  },

  /**
   * @function handleList
   * Handles list elements by updating path
   * @param {Object} state - Current state
   * @param {HTMLElement} element - Form element
   * @returns {Object} Updated state
   */
  handleList: ( state, element ) => {
    const name = ValueOps.getName( element );
    const items = Array.from( element.querySelectorAll( '.list-item' ) )
      .map( input => input.value.trim() );

    return {
      ...state,
      result: PathOps.setIn( state.result, [ 'main' ], {
        ...PathOps.getIn( state.result, [ 'main' ] ),
        [ name ]: items
      } )
    };
  },

  /**
   * @function handleArrayConversion
   * Converts objects to arrays
   * @param {Object} state - Current state
   * @returns {Object} Updated state with array conversion
   */
  handleArrayConversion: ( state ) => {
    const currentObj = PathOps.getIn( state.result, state.path );

    if ( currentObj.isList ) {
      const arrayItems = currentObj.items || [];
      delete currentObj.isList;
      delete currentObj.items;
      return {
        ...state,
        path: PathOps.pop( state.path ),
        result: PathOps.setIn( state.result, state.path, arrayItems )
      };
    }

    const arrayVersion = Object.entries( currentObj ).map( ( [ key, value ] ) =>
      key.endsWith( 'block' ) ? { [ key ]: value } :
        typeof value === 'string' ? value : value
    );

    return {
      ...state,
      path: PathOps.pop( state.path ),
      result: PathOps.setIn( state.result, state.path, arrayVersion )
    };
  },

  /**
   * @function handleObjectEnd
   * Handles object end by popping path
   * @param {Object} state - Current state
   * @returns {Object} Updated state
   */
  handleObjectEnd: ( state ) => ( {
    ...state,
    path: PathOps.pop( state.path )
  } )
};

/**
 * Transforms form elements to nested object structure
 * @param {HTMLElement[]} allFormElements - Form elements
 * @returns {Object|null} Transformed object
 */
export const transformFormElementsToObject = ( allFormElements ) => {

  try {
    const finalState = Array.from( allFormElements ).reduce( ( state, element ) => {
      const elementClasses = {
        isObject: element.classList.contains( 'is-object' ),
        isArray: element.classList.contains( 'is-array' ),
        isList: element.classList.contains( 'is-list' ),
        isLast: element.classList.contains( 'is-last' ),
        isLastInArray: element.classList.contains( 'array-last' )
      };

      switch ( true ) {
        case state.path.length === 1 && !elementClasses.isObject &&
          !elementClasses.isArray && !elementClasses.isList &&
          !elementClasses.isLastInArray:
          const { key, value } = ValueOps.getKeyValue( element );
          if ( !key ) return state;
          return {
            ...state,
            result: PathOps.setIn( state.result, [ 'main' ], {
              ...PathOps.getIn( state.result, [ 'main' ] ),
              [ key ]: value
            } )
          };

        case elementClasses.isObject || elementClasses.isArray:
          return FormStateOps.handleStructural( state, element );

        case elementClasses.isList:
          return FormStateOps.handleList( state, element );

        case !elementClasses.isLast:
          return FormStateOps.handleValue( state, element );

        case elementClasses.isLastInArray:
          return FormStateOps.handleArrayConversion( state );

        default:
          return FormStateOps.handleObjectEnd( state );
      }
    }, FormStateOps.createState() );

    return finalState.result.main;
  } catch ( error ) {
    console.error( 'Transformation error:', error );
    return null;
  }
};