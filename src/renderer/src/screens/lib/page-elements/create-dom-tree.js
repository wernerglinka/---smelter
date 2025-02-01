export function createDomTree( data, type, itemsAreDraggable = false ) {
  const ul = document.createElement( 'ul' );

  for ( const [ key, value ] of Object.entries( data ) ) {
    if ( Array.isArray( value ) ) {
      // Directory
      const dirLi = document.createElement( 'li' );
      const dirLiSpan = document.createElement( 'span' );
      dirLiSpan.textContent = key.split( '/' ).pop();
      dirLi.appendChild( dirLiSpan );
      dirLi.classList.add( 'folder' );
      const subUl = document.createElement( 'ul' );

      let loopIndex = 0;
      for ( const item of value ) {
        for ( const [ subKey, subValue ] of Object.entries( item ) ) {
          if ( typeof subValue === 'string' ) {
            // File

            // Check if the file is of the correct type
            if ( type && !subKey.endsWith( type ) ) {
              continue;
            }
            // Only add the file if it is of the correct type, e.g. '.md' for 
            // content files or 'json' for data files
            const fileLi = document.createElement( 'li' );
            fileLi.classList.add( 'file' );
            if ( itemsAreDraggable ) {
              fileLi.id = `${ subKey.split( '.' ).shift() }${ loopIndex }`;
              fileLi.classList.add( 'template-selection', 'draggable' );
              fileLi.draggable = true;
              fileLi.dataset.component = subKey;
            }

            // add filetype classes to use the proper icon in file list
            if ( subKey.endsWith( '.md' ) ) {
              fileLi.classList.add( 'md' );
            }
            if ( subKey.endsWith( '.json' ) ) {
              fileLi.classList.add( 'json' );
            }
            if ( subKey.endsWith( '.js' ) ) {
              fileLi.classList.add( 'js' );
            }

            const link = document.createElement( 'a' );
            link.href = subValue;
            link.textContent = subKey;
            fileLi.appendChild( link );
            subUl.appendChild( fileLi );
          } else {
            // Subdirectory
            const subTree = createDomTree( { [ subKey ]: subValue } );
            const fragment = document.createDocumentFragment();
            subTree.firstChild.classList.add( 'folder' );
            while ( subTree.firstChild ) {
              fragment.appendChild( subTree.firstChild );
            }
            subUl.appendChild( fragment );
          }
        }
        loopIndex++;
      }
      dirLi.appendChild( subUl );
      ul.appendChild( dirLi );
    } else {
      // File in the root directory
      const fileLi = document.createElement( 'li' );
      const link = document.createElement( 'a' );
      link.href = value;
      link.textContent = key;
      fileLi.appendChild( link );
      ul.appendChild( fileLi );
    }
  }

  return ul;
}

