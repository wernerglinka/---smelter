import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// File system utility functions
const readAllFiles = ( dir ) => {
  const files = fs.readdirSync( dir, { withFileTypes: true } );

  return files
    .filter( file => file.name !== '.DS_Store' )
    .map( file => {
      const fullPath = path.join( dir, file.name );
      return file.isDirectory()
        ? { [ file.name ]: readAllFiles( fullPath ) }
        : { [ file.name ]: fullPath };
    } );
};

export const FileSystem = {
  /**
   * Recursively reads directory structure
   * @param {string} rootDir - Root directory to start from
   * @returns {Object} Tree structure of directories and files
   */
  readDirectoryStructure: ( rootDir ) => ( {
    [ rootDir ]: readAllFiles( rootDir )
  } ),

  /**
   * Ensures a directory exists, creates if it doesn't
   * @param {string} dirPath - Directory path to check/create
   */
  ensureDirectoryExists: ( dirPath ) => {
    if ( !fs.existsSync( dirPath ) ) {
      fs.mkdirSync( dirPath, { recursive: true } );
    }
  },

  /**
   * Simple check for directory existence
   * @param {*} dirPath 
   * @returns 
   */
  directoryExists: ( dirPath ) => {
    try {
      return fs.existsSync( dirPath ) && fs.statSync( dirPath ).isDirectory();
    } catch {
      return false;
    }
  },

  deleteDirectory: ( dirPath ) => {
    try {
      if ( !fs.existsSync( dirPath ) ) {
        return { status: 'success', data: `Directory ${ dirPath } does not exist` };
      }

      fs.rmdirSync( dirPath, { recursive: true } );
      return { status: 'success', data: `Directory ${ dirPath } deleted` };

    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  /**
   * Read file with error handling
   * @param {string} filePath - Path to file
   * @param {string} encoding - File encoding (default: 'utf8')
   * @returns {Object} Status and data/error
   */
  readFile: ( filePath, encoding = 'utf8' ) => {
    try {
      const data = fs.readFileSync( filePath, encoding );
      return { status: 'success', data };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  /**
   * Write file with error handling
   * @param {string} filePath - Path to file
   * @param {string|Buffer} data - Data to write
   * @returns {Object} Status and error if failed
   */
  writeFile: ( filePath, data ) => {
    try {
      fs.writeFileSync( filePath, data );
      return { status: 'success' };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  /**
   * Delete file with error handling
   * @param {string} filePath - Path to file to delete
   * @returns {Object} Status and error if failed
   */
  deleteFile: ( filePath ) => {
    try {
      fs.unlinkSync( filePath );
      return { status: 'success' };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  /**
   * Check if file exists
   * @param {string} filePath - Path to check
   * @returns {boolean} True if file exists
   */
  fileExists: ( filePath ) => {
    try {
      return fs.existsSync( filePath );
    } catch {
      return false;
    }
  },

  /**
   * Get absolute path from relative path
   * @param {string} relativePath - Path relative to application root
   * @returns {string} Absolute path
   */
  getAbsolutePath: ( ...paths ) => {
    return path.join( __dirname, '../../', ...paths );
  }
};

export const createFileOperations = ( basePath ) => ( {
  readDirectoryStructure: ( dir ) =>
    FileSystem.readDirectoryStructure( path.join( basePath, dir ) ),

  ensureDirectoryExists: ( dir ) =>
    FileSystem.ensureDirectoryExists( path.join( basePath, dir ) ),

  readFile: ( filePath, encoding ) =>
    FileSystem.readFile( path.join( basePath, filePath ), encoding ),

  writeFile: ( filePath, data ) =>
    FileSystem.writeFile( path.join( basePath, filePath ), data ),

  deleteFile: ( filePath ) =>
    FileSystem.deleteFile( path.join( basePath, filePath ) ),

  fileExists: ( filePath ) =>
    FileSystem.fileExists( path.join( basePath, filePath ) )
} );