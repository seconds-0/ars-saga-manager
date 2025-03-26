# Claude Code Instructions

## MCP Tools

### ConsultSeniorEngineer MCP

- **Purpose**: Analyzes the entire codebase at once and provides senior-level engineering guidance
- **When to use**:
  - **Initial planning of big features** (highly recommended)
  - Analyzing large-scale architectural changes
  - Vetting complex implementation plans
  - Debugging difficult cross-module issues
  - **Security review of authentication systems** (REQUIRED)
  - **Debugging complex issues requiring multiple fix attempts** (REQUIRED)
  - **Troubleshooting auth flows or token systems** (REQUIRED)
  - **Investigating circular dependencies or infinite loops** (REQUIRED)
  - Database schema design validation
  - Performance optimization recommendations
  - Technical debt assessment
- **Usage**: Use whenever needed for complex issues, especially those related to security, state management, or multi-component interactions
- **How it works**: Pulls the entire codebase and analyzes it with a powerful LLM to provide comprehensive insights
- **Important**: For authentication fixes, refresh token implementations, or debugging infinite loops/circular dependencies, ALWAYS use this MCP before implementing solutions

## Documentation Check

When working with external systems or libraries:

1. **Always check for documentation:**

   - For any external systems, APIs, libraries, or frameworks
   - When encountering unfamiliar concepts or when stuck on a problem
   - Use the WebFetchTool to look up official documentation first

2. **Documentation sources to check:**

   - Official project websites and documentation
   - GitHub repositories and their README/wiki pages
   - API references and specifications
   - Community resources (Stack Overflow, forums) as secondary sources

3. **When to use WebFetchTool:**

   - Before implementing solutions with external dependencies
   - When error messages reference specific concepts/libraries
   - When stuck on implementation details
   - To verify best practices and coding standards

4. **How to use WebFetchTool effectively:**

   - Use specific search queries with library/framework name and feature
   - Include version information when relevant
   - Use URLs from error messages or official documentation sites
   - Formulate clear prompts that extract relevant information

5. **Apply documentation findings:**

   - Follow official patterns and best practices
   - Adhere to library-specific conventions
   - Use recommended data structures and methods
   - Check for version compatibility issues

## Memory Instructions

When using /compact to clear conversation history, ALWAYS update memory.md with:

- A timestamp
- Summary of the conversation and work accomplished
- List of files modified
- Current status and next steps
- Key decisions made

Review memory.md at the start of each new session to maintain context between conversations.

## Task Planning and Execution System

### Workplan Creation

Before implementing any feature or bugfix:

1. Create a dedicated workplan file in the `Documentation/Plans/` directory with naming format: `TaskID-Description.md` (e.g., `BUG-AuthFlow.md`, `FEAT-Abilities.md`)
2. Workplan structure must include:
   - **Task ID**: Simple identifier for reference (e.g., "FEAT-Abilities", "BUG-AuthFlow")
   - **Problem Statement**: Clear definition of what needs to be solved or implemented
   - **Components Involved**: Related areas of the system (broader than just files)
   - **Dependencies**: Prerequisite knowledge, components, or systems needed
   - **Implementation Checklist**: Step-by-step tasks with checkboxes
   - **Verification Steps**: How to confirm the implementation works correctly
   - **Decision Authority**: Clarify which decisions you can make independently vs which require user input
   - **Questions/Uncertainties**:
     - _Blocking_: Issues that must be resolved before proceeding
     - _Non-blocking_: Issues you can make reasonable assumptions about and proceed
   - **Acceptable Tradeoffs**: What compromises are acceptable for implementation speed
   - **Status**: One of [Not Started, In Progress, Completed, Blocked]
   - **Notes**: Any implementation decisions, challenges, or context for future reference

### Workplan Execution

1. Update the workplan Status from "Not Started" to "In Progress" when you begin implementation
2. Check off items in the checklist as they are completed
3. Add notes about implementation decisions or challenges encountered
4. For non-blocking uncertainties:
   - Document your working assumption
   - Proceed with implementation based on that assumption
   - Flag the assumption in the Notes section for future review
5. For blocking uncertainties:
   - Document the specific question or issue
   - Update status to "Blocked" if you cannot proceed
   - Once resolved, document the resolution and continue
6. Update the Status to "Completed" once all steps are finished and verified

### Memory Integration

1. After completing a workplan, update memory.md with:
   - Reference to the workplan: "Executed <Workplan Task ID>"
   - Brief summary of implementation results
   - Any notable challenges or decisions made
2. When reviewing memory.md, check referenced workplans for detailed context on previous work

## Build/Test/Lint Commands

- Backend: `cd backend && npm run dev` - Start development server
- Frontend: `cd frontend && npm start` - Start React app
- Run all tests: `npm run test:all` - Run all tests in backend and frontend
- Run single test: `cd frontend && npm test -- -t "test name"` or `cd backend && npm test -- -t "test name"`
- Frontend test with HTML report: `cd frontend && npm run test:html` - Generates test-report.html
- Start all services: `npm run start:all` - Start backend, frontend, and logging stack
- Stop all services: `npm run stop:all` - Gracefully shut down all services
- Health check: `npm run health` - Check status of all services

## Testing Environment Options

The project provides multiple ways to run tests, each with different performance characteristics:

### 1. Batched Test Runner (WSL)

For running tests in WSL with batching to mitigate timeouts:

- Run all tests in batches: `npm run test:batched`
- Run only frontend tests: `npm run test:batched:frontend`
- Run only backend tests: `npm run test:batched:backend`
- Run tests for recently changed files: `npm run test:changed`

Additional options:

- Set batch size: `npm run test:batched -- --batch-size=3`
- Filter tests by pattern: `npm run test:batched -- --pattern=VirtueFlaw`
- See detailed output: `npm run test:batched -- --verbose`

The batched test runner creates a detailed Markdown report in `/test-results/batched-test-report.md` with:

- Test summary statistics
- Detailed error information for failing tests
- Batch execution metadata

### 2. Docker-based Testing (Recommended)

For optimal performance, the Docker-based test runner provides isolated environment with better performance:

- Run all tests in Docker: `npm run test:docker`
- Build and run tests: `npm run test:docker:build`
- Run only frontend tests: `npm run test:docker:frontend`
- Run only backend tests: `npm run test:docker:backend`
- Run tests for specific file pattern: `npm run test:docker:file=src/components/*.test.js`

Benefits of Docker testing:

- Consistent environment across machines
- Significantly faster than WSL
- Avoids Windows filesystem performance issues
- Isolated dependencies from host system

### 3. WSL Optimization

To improve WSL performance, run the optimization script:

```
npm run test:wsl-optimize
```

This script:

- Creates optimal .wslconfig in Windows home directory
- Adjusts Linux memory and swap settings
- Configures disk I/O optimizations
- Sets up Node.js memory optimizations

After running, restart WSL with `wsl --shutdown` from PowerShell.

### 4. Simple Test Runner (Fastest)

For ultra-fast testing during development, the simple test runner bypasses Jest entirely:

```
npm run test:simple path/to/test.js
```

The simple test runner:

- Uses pure Node.js, avoiding Jest's overhead
- Supports basic Jest API (test/describe/expect)
- Runs in milliseconds instead of minutes
- Perfect for quick validation of logic
- Limitations: no UI component testing, limited matchers

Example test file:

```javascript
test("addition works", () => {
  expect(1 + 1).toBe(2);
});

describe("Array methods", () => {
  test("map works", () => {
    const arr = [1, 2, 3];
    const result = arr.map((x) => x * 2);
    expect(result).toEqual([2, 4, 6]);
  });
});
```

This option is ideal for quickly validating business logic, utilities, and other non-UI code during development.

## Code Style Guidelines

- **Naming**:

  - Variables/functions: camelCase (e.g., `handleSubmit`, `userData`)
  - Components/classes: PascalCase (e.g., `CharacterSheet`, `LoadingSpinner`)
  - Test files: Same name as component with `.test.js` suffix
  - Constants: UPPER_SNAKE_CASE for true constants (e.g., `VALID_CHARACTER_TYPES`)

- **Imports**: Group in this order with blank line separators:

  1. React and hooks
  2. Third-party libraries
  3. Project components/utilities

- **Component Structure**:

  - Functional components with hooks
  - Props destructuring at the top
  - State declarations next
  - Effect hooks
  - Event handlers
  - Helper functions
  - Return statement with JSX

- **State Management**:

  - React Query for server state
  - Local state with useState for UI state
  - Custom hooks for reusable state logic (e.g., `useVirtuesAndFlaws`, `useAuth`)

- **Testing Guidelines**:
  - Use the standardized test file structure from TEST-STANDARDIZATION.md
  - Include setup function with this pattern:
    ```javascript
    function setup(customProps = {}) {
      const defaultProps = {
        /* Default props */
      };
      const props = { ...defaultProps, ...customProps };
      const utils = render(<Component {...props} />);
      return { ...utils, mockFn: props.mockFn, props };
    }
    ```
  - Suppress console errors with this pattern:
    ```javascript
    const originalError = console.error;
    beforeAll(() => {
      console.error = jest.fn((message) => {
        if (message.includes("specific warning")) return;
        originalError.call(console, message);
      });
    });
    ```
  - Group tests with descriptive describe blocks (Rendering, User interactions, Edge cases)
  - Focus on testing behavior, not implementation details
  - Use data-testid selectors for reliable DOM interaction
  - Mock dependencies appropriately and consistently between tests
  - Reset mocks between tests with beforeEach/afterEach
  - Only use waitFor() for truly async operations
  - Test files should be colocated with components

## Unit Testing Best Practices

> **Note:** For comprehensive testing guidelines and examples, refer to:
>
> - [TEST-PATTERNS.md](./Documentation/TEST-PATTERNS.md) - General patterns
> - [TEST-STANDARDIZATION.md](./Documentation/Plans/TEST-STANDARDIZATION.md) - Standardized approach with example code
> - [**test-utils**/README.md](./frontend/src/__test-utils__/README.md) - Reusable test utilities and fixtures

### Test Utilities Module

The project provides a comprehensive set of standardized test utilities in the `__test-utils__` directory to ensure consistent testing patterns across all components:

```javascript
// Import all utilities (for small tests)
import * as testUtils from "../__test-utils__";

// Or import only what you need (preferred for larger test files)
import {
  setupComponent,
  setupWithQueryClient,
  setupConsoleSuppress,
  createAxiosMock,
  MOCK_CHARACTER,
} from "../__test-utils__";
```

#### Core Utilities

1. **Component Setup Functions**:

   - `setupComponent(Component, defaultProps, customProps)` - Basic component setup
   - `setupWithQueryClient(Component, defaultProps, customProps)` - With React Query provider
   - `setupWithRouter(Component, defaultProps, customProps)` - With React Router
   - `setupWithAuth(Component, defaultProps, customProps)` - With Auth provider
   - `setupWithAllProviders(Component, defaultProps, customProps)` - With all providers

2. **Console Error Suppression**:

   - `setupConsoleSuppress()` - Suppresses specific console errors during tests
   - `setupConsoleSuppress(['Warning:', 'Error:'])` - With custom patterns to suppress

3. **Mock Implementations**:

   - `createAxiosMock()` - Creates a standardized mock for axios
   - `mockUseAuth(authState)` - Creates mock implementation of useAuth hook
   - `AUTH_STATES` - Predefined auth states (AUTHENTICATED, UNAUTHENTICATED, etc.)

4. **Testing Fixtures**:
   - `CHARACTER_FIXTURES` - Mock character data
   - `VIRTUE_FLAW_FIXTURES` - Mock virtue/flaw data
   - `ABILITY_FIXTURES` - Mock ability data
   - `QUERY_STATES` - Predefined states for React Query tests

#### Standard Test Pattern

Every test file should follow this consistent pattern:

````javascript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from './YourComponent';
import { setupComponent, setupConsoleSuppress } from '../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Component-specific setup function
function setup(customProps = {}) {
  const defaultProps = {
    // Default prop values
  };

  return setupComponent(YourComponent, defaultProps, customProps);
}

describe('YourComponent', () => {
  describe('Rendering', () => {
    test('renders correctly', () => {
      setup();
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    test('handles user input', () => {
      const { props } = setup();
      fireEvent.click(screen.getByRole('button'));
      expect(props.onButtonClick).toHaveBeenCalled();
    });
  });
});

```javascript
// Import only what you need from the test utilities
import {
  setupWithQueryClient,
  setupConsoleSuppress,
  QUERY_STATES,
  createTestCharacter
} from '../__test-utils__';
````

Key utility categories:

- **Setup Functions**: `setupComponent()`, `setupWithQueryClient()`, `setupWithAuth()`, etc.
- **Mock Data**: Character, virtue/flaw, and ability fixtures
- **Query Helpers**: Predefined query states and mock implementations
- **Error Suppression**: Utilities to suppress specific console errors

Example standard test structure:

```javascript
import { setupWithQueryClient, setupConsoleSuppress } from "../__test-utils__";

// Suppress specific console errors
setupConsoleSuppress(["Warning:", "act(...)"]);

describe("MyComponent", () => {
  function setup(customProps = {}) {
    const defaultProps = {
      /* defaults */
    };
    return setupWithQueryClient(MyComponent, defaultProps, customProps);
  }

  describe("Rendering", () => {
    test("renders correctly", () => {
      const { getByText } = setup();
      expect(getByText("Expected Content")).toBeInTheDocument();
    });
  });
});
```

### Test Structure

- Begin each test file with standard imports and mock setup
- Group tests using descriptive describe blocks (Rendering, Interactions, Error handling, etc.)
- Use consistent setup functions for component rendering
- Test behavior, not implementation details

### Component Testing Checklist

- Initial render state verification
- Props handling and propagation
- User interactions (clicks, inputs, form submission)
- Conditional rendering paths
- Error states and messages
- Loading states
- Empty/null state handling
- Accessibility concerns

### Mock Guidelines

- Mock all external dependencies (API calls, hooks, context)
- Use consistent mock patterns across files
- Reset mocks between tests with beforeEach/afterEach
- Document complex mocks with comments

### Test Organization for Complex Components

- **Structure:**

  - Organize test files to mirror component hierarchy
  - For large components, split tests into logical sections with separate describe blocks
  - Create dedicated test files for complex subcomponents
  - Use a consistent naming pattern: `ComponentName.test.js` and `ComponentName.integration.test.js`

- **Shared Resources:**

  - Create `__test-utils__` directories for shared fixtures and helpers
  - Extract common setup functions into reusable utilities
  - Build mock factories for commonly tested data structures
  - Document test fixtures with comments explaining their purpose

- **Refactoring Existing Tests:**
  - Identify and extract repeated setup code into helper functions
  - Split monolithic test files into dedicated context-specific files
  - Move common mock configurations to shared setup files
  - Add explicit describe blocks to group related tests

### Testing Complex State Management

- **Hook Testing Strategy:**

  - Create separate test files for custom hooks: `useCustomHook.test.js`
  - Test hooks in isolation using `renderHook` from Testing Library
  - Verify all state transitions with explicit assertions
  - Test effect cleanup functions to prevent memory leaks

- **Component State Testing:**

  - Test each distinct state representation in the UI
  - Verify state transitions triggered by user interactions
  - Test asynchronous state updates with appropriate waiting patterns
  - Ensure error states are properly represented in the UI

- **Refactoring Existing Tests:**
  - Extract state management testing into dedicated hook tests
  - Add missing tests for state transition edge cases
  - Add explicit tests for async loading/error states
  - Document complex state flows with test comments

### Testing Error Boundaries and Recovery

- **Error Boundary Testing:**

  - Create dedicated tests for error boundary components
  - Test both error and non-error rendering paths
  - Verify error details are appropriately displayed/logged
  - Test recovery mechanisms (retries, resets, fallbacks)

- **Component Error Testing:**

  - Add explicit tests that trigger component errors
  - Verify fallback UI rendering when errors occur
  - Test that errors are properly contained and don't cascade
  - Verify error reporting mechanisms work correctly

- **Refactoring Existing Tests:**
  - Add error boundary tests for components missing them
  - Review error states in existing components and add missing tests
  - Implement consistent error simulation techniques
  - Document expected error behavior in test descriptions

### Balancing Test Coverage and Maintenance

- **Coverage Strategy:**

  - **Core Business Logic:** 90%+ coverage
  - **UI Components:** Focus on key user interactions and rendering paths
  - **Utility Functions:** 100% coverage
  - **Configuration/Constants:** Minimal testing

- **Optimizing Test Efficiency:**

  - Use parameterized tests for similar scenarios
  - Test behaviors, not implementation details
  - Limit snapshot testing to stable components
  - Group related assertions to minimize test runs

- **Sustainable Maintenance:**

  - Update tests when component behavior changes
  - Delete tests for removed functionality
  - Document complex test setups with comments
  - Mark explicitly ignored tests with reasons

- **Refactoring Existing Tests:**
  - Identify over-tested areas and simplify
  - Add missing tests for critical functionality
  - Convert imperative test sequences to declarative assertions
  - Add JSDoc comments for test intent and coverage decisions

### Basic Usability Testing

- Verify interactive elements (buttons, links) function properly
- Ensure form elements can be completed and submitted
- Test that error messages are visible and understandable
- Use data-testid attributes for stable test selectors

### Performance Considerations

- Add specific tests for expensive operations
- Test memo/callback optimizations actually prevent rerenders
- Test lazy-loaded components render correctly

### Test Maintenance

- Colocate tests with components
- Update tests with component changes
- Avoid brittle selectors dependent on DOM structure
- Document test assumptions in comments

- **Error Handling**:

  - Frontend: Component error states and ErrorBoundary
  - Backend: AppError class with isOperational flag
  - Consistent error response structure: `{ status, message }`

- **Validation**:

  - Frontend: Form validation with error messages
  - Backend: Joi schemas for request validation (see `backend/middleware/validation.js`)
  - Domain-specific rules in validation utilities (see `virtueFlawValidation.js`)
  - Input sanitization middleware (see `backend/middleware/sanitizer.js`)

- **Styling**:

  - Tailwind CSS for utility-first styling
  - Theme extensions in tailwind.config.js with medieval-themed colors
  - Responsive design patterns with mobile-first approach
  - Use of Flowbite components when appropriate

- **API Responses**:
  - Standard format: `{ status, data }` for success, `{ status, message }` for errors
  - HTTP status codes matching response content
  - Structured error messages for validation failures

## Current Development Focus

<Checklist of its current state. Claude updates this>
