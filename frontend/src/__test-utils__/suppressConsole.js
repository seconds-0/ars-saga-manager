/**
 * Suppresses specific console errors during tests
 * @param {Array} suppressPatterns - Array of string patterns to suppress
 * @returns {Function} Cleanup function to restore console.error
 */
export function suppressConsoleErrors(suppressPatterns = []) {
  const originalConsoleError = console.error;
  
  console.error = jest.fn((message, ...args) => {
    // Check if message matches any patterns to suppress
    if (suppressPatterns.some(pattern => 
      typeof message === 'string' && message.includes(pattern)
    )) {
      return;
    }
    
    // Otherwise, call original console.error
    originalConsoleError(message, ...args);
  });
  
  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
  };
}

/**
 * Common React error patterns to suppress in tests
 */
export const COMMON_SUPPRESS_PATTERNS = [
  'Warning: An update to', 
  'Warning: Cannot update a component',
  'Warning: validateDOMNesting',
  'Warning: ReactDOM.render',
  'Warning: Failed prop type',
  'Warning: Each child in a list',
  'Warning: The tag <',
  'Error: Uncaught [TypeError',
  'act(...)',
  'useLayoutEffect'
];

/**
 * Sets up console error suppression in beforeAll and restores in afterAll
 * @param {Array} patterns - Patterns to suppress
 * @example
 * // In your test file:
 * import { setupConsoleSuppress } from '../__test-utils__/suppressConsole';
 * 
 * setupConsoleSuppress(['Warning: An update to']);
 */
export function setupConsoleSuppress(patterns = COMMON_SUPPRESS_PATTERNS) {
  let cleanup;
  
  beforeAll(() => {
    cleanup = suppressConsoleErrors(patterns);
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
}