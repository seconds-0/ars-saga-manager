/**
 * Utility for rendering components with standard providers in tests
 * 
 * This provides a consistent way to render components that need
 * various context providers like CharacterProvider, QueryClientProvider, etc.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { createTestQueryClient } from './queryUtils';
// We need to import the mock version for tests
// The mock should be in __mocks__/contexts/CharacterProvider.js
// and will be automatically used because jest.mock() is set up
import { CharacterProvider } from '../contexts/CharacterProvider';

/**
 * Options for renderWithProviders
 * @typedef {Object} RenderOptions
 * @property {boolean} withRouter - Whether to wrap with Router
 * @property {boolean} withQueryClient - Whether to wrap with QueryClientProvider
 * @property {boolean} withCharacterProvider - Whether to wrap with CharacterProvider
 * @property {Object} characterData - Mock data for CharacterProvider
 * @property {Object} queryClient - Custom QueryClient instance
 */

/**
 * Renders a component with common providers for testing
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {RenderOptions} options - Render options
 * @returns {Object} The render result
 */
export function renderWithProviders(ui, options = {}) {
  const {
    withRouter = false,
    withQueryClient = false,
    withCharacterProvider = false,
    characterData = {},
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  // Function to wrap the component with providers
  function Wrapper({ children }) {
    // Start with the children
    let wrappedChildren = children;

    // Add providers from innermost to outermost
    if (withCharacterProvider) {
      wrappedChildren = (
        <CharacterProvider mockData={characterData}>
          {wrappedChildren}
        </CharacterProvider>
      );
    }

    if (withQueryClient) {
      wrappedChildren = (
        <QueryClientProvider client={queryClient}>
          {wrappedChildren}
        </QueryClientProvider>
      );
    }

    if (withRouter) {
      wrappedChildren = (
        <BrowserRouter>
          {wrappedChildren}
        </BrowserRouter>
      );
    }

    return wrappedChildren;
  }

  // Render with the wrapper
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

export default renderWithProviders;