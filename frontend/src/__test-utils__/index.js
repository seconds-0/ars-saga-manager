// Core Utilities
export * from './setup';
export * from './suppressConsole';
export * from './queryUtils';
export * from './testHelpers';
export * from './hookUtils';

// Mocks
export * from './mocks/axios';
export * from './mocks/useAuth';

// Fixtures
export * from './fixtures/characters';
export * from './fixtures/virtuesFlaws';
export * from './fixtures/abilities';

/**
 * This file provides a convenient way to import all test utilities at once.
 * 
 * Example usage:
 * ```
 * import { 
 *   setupWithAllProviders, 
 *   setupConsoleSuppress,
 *   createAxiosMock,
 *   CHARACTER_FIXTURES,
 *   setupHookWithQueryClient
 * } from '../__test-utils__';
 * ```
 * 
 * However, for better performance when bundling tests, consider importing
 * only the specific utilities you need directly from their respective files.
 */