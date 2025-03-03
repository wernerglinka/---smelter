// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn()
};

// Suppress deprecation warnings
process.emitWarning = jest.fn();

// Add any other global test setup here
