/**
 * Enhanced standardized mock implementation of axios
 * 
 * This mock provides a consistent interface for tests with:
 * - All HTTP methods (get, post, put, delete, patch)
 * - Support for axios.create() pattern
 * - Configurable default responses
 * - Full interceptor mock implementation
 * - Easy reset between tests
 * 
 * It's designed to work consistently across all tests and provide
 * a reliable mock layer for the axios HTTP client.
 */

// Default success response template for batch operations
const DEFAULT_BATCH_RESPONSE = {
  status: 'success',
  results: [{ 
    abilityId: '123', 
    action: 'increment', 
    success: true,
    data: { id: '123', score: 2 } 
  }]
};

// Generic default response for most requests
const DEFAULT_RESPONSE = {};

/**
 * Create a complete mock axios instance with all methods
 * Each instance has its own set of mock functions that can be
 * configured independently for each test
 */
const createMockInstance = () => {
  // Create the core mock methods
  const instance = {
    // HTTP methods
    get: jest.fn(() => Promise.resolve({ data: DEFAULT_RESPONSE })),
    post: jest.fn(() => Promise.resolve({ data: DEFAULT_BATCH_RESPONSE })),
    put: jest.fn(() => Promise.resolve({ data: DEFAULT_RESPONSE })),
    delete: jest.fn(() => Promise.resolve({ data: DEFAULT_RESPONSE })),
    patch: jest.fn(() => Promise.resolve({ data: DEFAULT_RESPONSE })),
    
    // Configuration
    defaults: {
      baseURL: '',
      headers: {
        common: {},
        post: { 'Content-Type': 'application/json' }
      }
    },
    
    // Interceptors
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
        handlers: []
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
        handlers: []
      }
    },
    
    // Allow resetting all mocks with one call
    resetAllMocks: function() {
      this.get.mockReset();
      this.post.mockReset();
      this.put.mockReset();
      this.delete.mockReset();
      this.patch.mockReset();
      
      // Reset to default behavior
      this.get.mockImplementation(() => Promise.resolve({ data: DEFAULT_RESPONSE }));
      this.post.mockImplementation(() => Promise.resolve({ data: DEFAULT_BATCH_RESPONSE }));
      this.put.mockImplementation(() => Promise.resolve({ data: DEFAULT_RESPONSE }));
      this.delete.mockImplementation(() => Promise.resolve({ data: DEFAULT_RESPONSE }));
      this.patch.mockImplementation(() => Promise.resolve({ data: DEFAULT_RESPONSE }));
      
      // Reset interceptors
      this.interceptors.request.use.mockReset();
      this.interceptors.request.eject.mockReset();
      this.interceptors.response.use.mockReset();
      this.interceptors.response.eject.mockReset();
      
      return this;
    },
    
    // Setup batch response for testing batch operations
    setupBatchResponse: function(results = []) {
      this.post.mockImplementation(() => Promise.resolve({
        data: {
          status: 'success',
          results: results.length > 0 ? results : DEFAULT_BATCH_RESPONSE.results
        }
      }));
      return this;
    },
    
    // Setup an error response for any method
    setupErrorResponse: function(method, errorMessage, status = 400) {
      if (!this[method]) {
        throw new Error(`Invalid method: ${method}`);
      }
      
      const error = new Error(errorMessage);
      error.response = {
        status,
        data: { message: errorMessage }
      };
      
      this[method].mockImplementation(() => Promise.reject(error));
      return this;
    }
  };
  
  return instance;
};

// Create the main mockAxios object
const mockAxios = createMockInstance();

// Add the create method that returns a new mock instance
mockAxios.create = jest.fn(() => createMockInstance());

export default mockAxios;