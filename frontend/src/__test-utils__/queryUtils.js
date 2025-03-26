import { QueryClient } from 'react-query';

/**
 * Standard query states for testing
 */
export const QUERY_STATES = {
  LOADING: {
    isLoading: true,
    isError: false,
    isSuccess: false,
    data: undefined,
    error: null,
  },
  ERROR: {
    isLoading: false,
    isError: true,
    isSuccess: false,
    data: undefined,
    error: new Error('Test error'),
  },
  SUCCESS_EMPTY: {
    isLoading: false,
    isError: false,
    isSuccess: true,
    data: [],
    error: null,
  },
  SUCCESS_WITH_DATA: (data) => ({
    isLoading: false,
    isError: false,
    isSuccess: true,
    data,
    error: null,
  }),
};

/**
 * Creates a useQuery mock with predefined state
 * @param {Object} queryState - Query state to mock
 * @returns {Function} Mocked useQuery implementation
 */
export function mockUseQuery(queryState = QUERY_STATES.SUCCESS_EMPTY) {
  return jest.fn().mockReturnValue(queryState);
}

/**
 * Creates a useMutation mock with predefined behavior
 * @param {Function} mockFn - Mocked mutation function
 * @param {Object} state - Mutation state
 * @returns {Object} Mocked useMutation result
 */
export function mockUseMutation(mockFn = jest.fn(), state = {}) {
  return jest.fn().mockReturnValue({
    mutate: mockFn,
    mutateAsync: mockFn,
    isLoading: false,
    isError: false,
    isSuccess: false,
    ...state,
  });
}

/**
 * Builds a QueryClient with prefilled cache data for testing
 * @param {Object} queryData - Map of query keys to their data
 * @returns {QueryClient} QueryClient with prefilled cache
 */
export function buildQueryClientWithData(queryData = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    },
  });

  // Prefill the cache with provided data
  Object.entries(queryData).forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey.split('/'), data);
  });

  return queryClient;
}

/**
 * Utility to wait for all pending queries to settle
 * @param {QueryClient} queryClient - The QueryClient instance
 * @returns {Promise} Promise that resolves when queries settle
 */
export async function waitForQueries(queryClient) {
  // Get all query cache instances
  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.findAll();
  
  // Wait for all queries to settle
  return Promise.all(
    queries.map(query => {
      // If the query is already settled, return a resolved promise
      if (!query.isLoading()) return Promise.resolve();
      
      // Otherwise, create a promise that resolves when the query settles
      return new Promise(resolve => {
        const unsubscribe = queryClient.getQueryCache().subscribe(() => {
          if (!query.isLoading()) {
            unsubscribe();
            resolve();
          }
        });
      });
    })
  );
}