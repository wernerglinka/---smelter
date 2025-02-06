import { useState, useEffect } from 'react';

/**
 * @typedef {Object} Versions
 * @property {string} electron - Electron version
 * @property {string} chrome - Chrome version
 * @property {string} node - Node.js version
 * @property {string} v8 - V8 engine version
 */

/**
 * Default versions object when actual versions cannot be retrieved
 * @type {Versions}
 */
const DEFAULT_VERSIONS = {
  electron: 'N/A',
  chrome: 'N/A',
  node: 'N/A',
  v8: 'N/A'
};

/**
 * Versions component displays the current versions of Electron, Chrome, Node.js, and V8
 * @returns {JSX.Element|null} The rendered component or null while loading
 */
function Versions() {
  // State to store version information
  const [versions, setVersions] = useState(/** @type {Versions|null} */ (null));

  useEffect(() => {
    /**
     * Initializes the versions state by fetching from electronAPI
     * @throws {Error} When electronAPI is not available or versions cannot be accessed
     */
    const initializeVersions = () => {
      try {
        setVersions(window.electronAPI?.process?.versions || DEFAULT_VERSIONS);
      } catch (error) {
        console.error('Failed to get versions:', error);
        setVersions(DEFAULT_VERSIONS);
      }
    };

    initializeVersions();
  }, []);

  if (!versions) {
    return null;
  }

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
      <li className="v8-version">V8 v{versions.v8}</li>
    </ul>
  );
}

export default Versions;
