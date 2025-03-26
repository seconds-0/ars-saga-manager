/**
 * Creates a standardized mock for axios
 * @returns {Object} Axios mock with common methods
 */
export function createAxiosMock() {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
}

/**
 * Configures axios mock to return success responses
 * @param {Object} mockAxios - Axios mock created with createAxiosMock
 * @param {Object} responses - Map of URLs to response data
 * @example
 * setupAxiosSuccess(mockAxios, {
 *   '/api/users': [{ id: 1, name: 'Test' }],
 *   '/api/posts': [{ id: 1, title: 'Test' }],
 * });
 */
export function setupAxiosSuccess(mockAxios, responses = {}) {
  Object.entries(responses).forEach(([url, data]) => {
    mockAxios.get.mockImplementation((requestUrl) => {
      if (requestUrl === url) {
        return Promise.resolve({
          data: { status: 'success', data },
          status: 200,
        });
      }
      return Promise.resolve({ data: { status: 'success', data: [] } });
    });
  });
  
  // Default implementation for other methods
  mockAxios.post.mockImplementation(() => 
    Promise.resolve({ data: { status: 'success', data: { id: 'new-id' } } })
  );
  
  mockAxios.put.mockImplementation(() => 
    Promise.resolve({ data: { status: 'success', data: { id: 'updated-id' } } })
  );
  
  mockAxios.delete.mockImplementation(() => 
    Promise.resolve({ data: { status: 'success', data: null } })
  );
  
  return mockAxios;
}

/**
 * Configures axios mock to return error responses
 * @param {Object} mockAxios - Axios mock created with createAxiosMock
 * @param {Object} errors - Map of URLs to error messages
 * @example
 * setupAxiosError(mockAxios, {
 *   '/api/users': 'Failed to fetch users',
 * });
 */
export function setupAxiosError(mockAxios, errors = {}) {
  Object.entries(errors).forEach(([url, message]) => {
    mockAxios.get.mockImplementation((requestUrl) => {
      if (requestUrl === url) {
        return Promise.reject({
          response: {
            data: { status: 'error', message },
            status: 400,
          },
        });
      }
      return Promise.resolve({ data: { status: 'success', data: [] } });
    });
  });
  
  return mockAxios;
}