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
  - **Planning and reviewing core game logic implementations** (e.g., detailed Experience point calculations, Ability cost/spending validation, Virtue/Flaw effect interactions)
  - Reviewing the interaction points between major systems (e.g., Virtues/Flaws, Experience, Abilities)
  - Database schema design validation
  - Performance optimization recommendations
  - Technical debt assessment
- **Usage**: Use whenever needed for complex issues, especially those related to security, state management, core game mechanics, or multi-component interactions
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
2. **Continuously update the workplan `.md` file** as you complete checklist items. Check off items as they are completed. Add implementation notes, challenges encountered, and any deviations from the plan directly into the 'Notes' section of the workplan file. Change the 'Status' field as appropriate.
3. For non-blocking uncertainties:
   - Document your working assumption
   - Proceed with implementation based on that assumption
   - Flag the assumption in the Notes section for future review
4. For blocking uncertainties:
   - Document the specific question or issue
   - Update status to "Blocked" if you cannot proceed
   - Once resolved, document the resolution and continue
5. Update the Status to "Completed" once all steps are finished and verified

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

The project provides multiple ways to run tests, each with different performance characteristics, especially relevant in WSL environments.

### Recommended Testing Workflow During Development

1.  **Logic & Utilities (Backend/Frontend):** For pure logic files (`experienceUtils.js`, `abilityUtils.js`, `virtueFlawValidation.js`, `virtueFlawPoints.js`), **use the Simple Test Runner (`npm run test:simple path/to/your.test.js`)** for the fastest feedback loop during implementation and debugging.
2.  **Frontend Components & Hooks:** For React components (`AbilityInput.js`, `AbilityList.js`) and hooks (`useAbilities.js`), use either the **Batched Test Runner (`npm run test:batched:frontend`)** or the **Docker Runner (`npm run test:docker:frontend`)** if Docker is available and faster on your system. Avoid direct `npm test` in WSL for frontend tests due to likely timeouts.
3.  **Full Suite:** Run the full suite (`npm run test:all` or `npm run test:batched`) less frequently, primarily before committing major changes or requesting reviews.

### Detailed Runner Options

#### 1. Batched Test Runner (WSL)

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

#### 2. Docker-based Testing (Recommended for Full Suite)

For optimal performance, the Docker-based test runner provides an isolated environment:

- Run all tests in Docker: `npm run test:docker`
- Build and run tests: `npm run test:docker:build`
- Run only frontend tests: `npm run test:docker:frontend`
- Run only backend tests: `npm run test:docker:backend`
- Run tests for specific file pattern: `npm run test:docker:file=src/components/*.test.js`

Benefits of Docker testing:

- Consistent environment across machines
- Significantly faster than WSL for the full suite
- Avoids Windows filesystem performance issues
- Isolated dependencies

#### 3. WSL Optimization

To improve WSL performance, run the optimization script:
Use code with caution.
Markdown
npm run test:wsl-optimize

This script configures `.wslconfig`, Linux memory/swap, disk I/O, and Node.js settings. Restart WSL (`wsl --shutdown`) after running.

#### 4. Simple Test Runner (Fastest for Logic)

For ultra-fast validation of non-UI code during development:
Use code with caution.
npm run test:simple path/to/test.js

The simple test runner:

- Uses pure Node.js, avoiding Jest's overhead.
- Supports basic Jest API (test/describe/expect).
- Runs in milliseconds.
- Perfect for validating business logic, utilities, backend code.
- Limitations: no UI component testing, limited matchers.

## Database Management

- **Migrations:**
  - For any changes to the database schema (adding tables, columns, constraints), **create a new migration file** in `backend/migrations/` using `npx sequelize-cli migration:generate --name descriptive-name`.
  - Implement both the `up` and `down` functions carefully.
  - Test migrations locally before committing, if feasible (e.g., using `db:migrate:undo` then `db:migrate` again).
- **Seeders:**
  - If reference data needs updating due to schema changes (e.g., adding new fields like `exp_rate_modifier` to existing Virtues), **update the relevant seeder files** in `backend/seeders/`.
  - Ensure seeders are idempotent or handle potential conflicts if run multiple times.
  - Consider the order if seeders depend on each other.
- **Database Schema Documentation:** After successful migration and testing, run `npm run docs:db-schema` to update `Documentation/databaseSchema.txt`.

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

  - **Mandatory:** Use the standardized test utilities provided in `frontend/src/__test-utils__` for all new frontend component and hook tests. Refer to `frontend/src/__test-utils__/README.md` for usage details.
  - Use the standardized test file structure from TEST-STANDARDIZATION.md.
  - Include setup function pattern from `__test-utils__`.
  - Suppress expected console errors using utilities from `__test-utils__`.
  - Group tests with descriptive describe blocks (Rendering, User interactions, Edge cases).
  - Focus on testing behavior, not implementation details.
  - Use data-testid selectors primarily for stable DOM interaction, but prefer user-facing roles/text where feasible.
  - Mock dependencies appropriately and consistently. Reset mocks between tests.
  - Use `waitFor()` only for truly async operations.
  - Colocate tests with components/modules.
  - **Logic Tests:** Pay special attention to creating thorough unit tests for core game logic (e.g., `experienceUtils.js`, `abilityUtils.js`). Use the **Simple Test Runner** for these during development.

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

## Unit Testing Best Practices

> **Note:** For comprehensive testing guidelines and examples, refer to:
>
> - [TEST-PATTERNS.md](./Documentation/TEST-PATTERNS.md) - General patterns
> - [TEST-STANDARDIZATION.md](./Documentation/Plans/TEST-STANDARDIZATION.md) - Standardized approach with example code
> - [**test-utils**/README.md](./frontend/src/__test-utils__/README.md) - Reusable test utilities and fixtures

### Test Utilities Module (**REQUIRED for Frontend Tests**)

The project provides a comprehensive set of standardized test utilities in the `__test-utils__` directory to ensure consistent testing patterns across all components:

```javascript
// Import only what you need (preferred)
import {
  setupComponent,
  setupWithQueryClient,
  setupConsoleSuppress,
  createAxiosMock,
  CHARACTER_FIXTURES,
  AUTH_STATES
} from '../__test-utils__';
Use code with caution.
Core Utilities
Component Setup Functions: setupComponent(), setupWithQueryClient(), setupWithRouter(), setupWithAuth(), setupWithAllProviders()

Console Error Suppression: setupConsoleSuppress(), suppressConsoleErrors()

Mock Implementations: createAxiosMock(), mockUseAuth(), AUTH_STATES

Testing Fixtures: CHARACTER_FIXTURES, VIRTUE_FLAW_FIXTURES, ABILITY_FIXTURES, QUERY_STATES

Hook Testing Utilities: setupHook(), setupHookWithQueryClient(), setupHookWithAuth(), waitForHookToSettle(), HOOK_STATES

Standard Test Pattern
Every test file should follow this consistent pattern:

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from './YourComponent';
import { setupComponent, setupConsoleSuppress } from '../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Component-specific setup function
function setup(customProps = {}) {
  const defaultProps = { /* Default prop values */ };
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
Use code with caution.
JavaScript
Test Structure
Begin each test file with standard imports and mock setup using __test-utils__.

Group tests using descriptive describe blocks.

Use consistent setup functions for component rendering.

Test behavior, not implementation details.

Component Testing Checklist
Initial render state verification

Props handling

User interactions

Conditional rendering

Error/Loading/Empty states

Accessibility concerns

Mock Guidelines
Mock all external dependencies using __test-utils__ helpers where possible.

Use consistent mock patterns. Reset mocks between tests.

Testing Complex State Management
Test custom hooks in isolation using renderHook and hookUtils.

Verify all state transitions.

Balancing Test Coverage and Maintenance
Coverage Strategy: Aim for high coverage on core logic (utils, services) and critical UI paths.

Efficiency: Use parameterized tests, test behaviors, limit snapshots.

Maintenance: Update tests with component changes, document complex tests.

Current Development Focus
<Checklist of its current state. Claude updates this>

## Tool Constraints

- **Unable to run Sequelize CLI commands** - When database migrations and seeds need to be executed, prompt the user to run commands like `npx sequelize-cli db:migrate` and `npx sequelize-cli db:seed:all` rather than attempting to run them directly.
- **Auth middleware consistency** - The project uses `authenticateToken` from `auth.js` for all protected routes. Do not use `isAuthenticated` which doesn't exist.

## Tool Constraints

- **Unable to run Sequelize CLI commands** - When database migrations and seeds need to be executed, prompt the user to run commands like `npx sequelize-cli db:migrate` and `npx sequelize-cli db:seed:all` rather than attempting to run them directly.
- **Auth middleware consistency** - The project uses `authenticateToken` from `auth.js` for all protected routes. Do not use `isAuthenticated` which doesn't exist.
```
