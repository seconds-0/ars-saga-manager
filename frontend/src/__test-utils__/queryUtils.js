/**
 * Utilities for working with React Query in tests
 */
import { QueryClient } from 'react-query';

/**
 * Creates a test QueryClient with logging disabled and sensible defaults
 * @returns {QueryClient} A configured QueryClient for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't retry failed queries in tests
        retry: false,
        // Don't refetch queries on window focus in tests
        refetchOnWindowFocus: false,
        // Disable caching for tests to avoid state leaking between tests
        cacheTime: 0,
        // Use a short stale time so stale data is quickly refreshed
        staleTime: 0,
      },
    },
    // Prevent noise in test output
    logger: {
      log: console.log,
      warn: console.warn,
      // Silence errors since we expect some errors in tests
      error: () => {},
    },
  });
}

/**
 * Mocks the response for a specific query key
 * 
 * @param {QueryClient} queryClient - The query client to mock
 * @param {Array|string} queryKey - The query key to mock a response for
 * @param {any} response - The response data to mock
 */
export function mockQueryResponse(queryClient, queryKey, response) {
  queryClient.setQueryData(queryKey, response);
}

/**
 * Mocks an error for a specific query key
 * 
 * @param {QueryClient} queryClient - The query client to mock
 * @param {Array|string} queryKey - The query key to mock an error for
 * @param {Error} error - The error to mock
 */
export function mockQueryError(queryClient, queryKey, error) {
  queryClient.setQueryData(queryKey, {
    error,
  });
}

/**
 * Resets all query cache
 * 
 * @param {QueryClient} queryClient - The query client to reset
 */
export function resetQueries(queryClient) {
  queryClient.clear();
}

export default { createTestQueryClient, mockQueryResponse, mockQueryError, resetQueries };
