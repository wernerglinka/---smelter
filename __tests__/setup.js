// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Environment variable for test debugging
const DEBUG_TESTS = process.env.DEBUG_TESTS === 'true';

// Store original console methods
const originalConsole = { ...console };

// Silence logs in tests unless DEBUG_TESTS is enabled
beforeAll(() => {
  if (!DEBUG_TESTS) {
    jest.spyOn(global.console, 'log').mockImplementation(() => {});
    jest.spyOn(global.console, 'debug').mockImplementation(() => {});
    jest.spyOn(global.console, 'info').mockImplementation(() => {});
    
    // We still want to see warnings and errors, but as mocks for verification
    jest.spyOn(global.console, 'warn').mockImplementation(() => {});
    jest.spyOn(global.console, 'error').mockImplementation(() => {});
  }
});

// Restore original console methods after all tests
afterAll(() => {
  jest.restoreAllMocks();
});

// Suppress deprecation warnings
process.emitWarning = jest.fn();

// Add any other global test setup here
