/**
 * Standardized mock for the axios instance used in the api directory
 * This provides a consistent mock interface for all tests
 */

// Create a mock axios instance with all methods
const createMockInstance = () => ({
  // Request methods
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  
  // Config
  defaults: {
    baseURL: 'http://localhost:3001/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  },
  
  // Interceptors
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn()
    },
    response: {
      use: jest.fn(),
      eject: jest.fn()
    }
  },
  
  // Create method that returns a new instance
  create: jest.fn(() => createMockInstance())
});

// Create a reusable mock instance
const mockApiInstance = createMockInstance();

// Export the instance
module.exports = mockApiInstance;
