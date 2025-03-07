/**
 * Logger utility for consistent logging with environment-based controls
 * 
 * Provides different log levels (DEBUG, INFO, WARN, ERROR) with
 * automatic suppression based on environment.
 * 
 * @module logger
 */

class Logger {
  constructor() {
    // Default log level based on environment
    this.level = process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === 'production' ? 'ERROR' : 
       process.env.NODE_ENV === 'test' ? 'WARN' : 'DEBUG');

    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      NONE: 4
    };
  }

  /**
   * Change the current logging level
   * @param {string} level - New log level ('DEBUG', 'INFO', 'WARN', 'ERROR', 'NONE')
   */
  setLevel(level) {
    if (this.levels[level] !== undefined) {
      this.level = level;
    }
  }

  /**
   * Log debug message - only in development by default
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (this.levels[this.level] <= this.levels.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Log info message - informational status updates
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    if (this.levels[this.level] <= this.levels.INFO) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log warning message - handled issues or potential problems
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    if (this.levels[this.level] <= this.levels.WARN) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Log error message - critical problems
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    if (this.levels[this.level] <= this.levels.ERROR) {
      console.error('[ERROR]', ...args);
    }
  }
}

export const logger = new Logger();