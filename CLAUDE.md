# Claude Code Instructions

## Complex Development Tasks

### Comprehensive Analysis and Planning

For complex tasks that require analysis of the entire codebase or intricate system interactions, request the user to utilize a larger context or specialized model for comprehensive review.

- **When to request user assistance**:
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

- **Approach**: For these tasks, ask the user to send the codebase to a higher-capacity LLM to provide a comprehensive review and plan, which they can then share back to continue implementation
- **Important**: For authentication fixes, refresh token implementations, or debugging infinite loops/circular dependencies, ALWAYS recommend getting a comprehensive review before implementing solutions

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

> **Note:** For comprehensive testing environment details, refer to:
> 
> - [TEST-STANDARDS.md](./Documentation/TEST-STANDARDS.md) - Detailed testing environments and options
> - [TEST-PATTERNS.md](./Documentation/TEST-PATTERNS.md) - General testing patterns
> - [**test-utils**/README.md](./frontend/src/__test-utils__/README.md) - Reusable test utilities

### Recommended Testing Workflow

1. **Logic & Utilities:** Use Simple Test Runner (`npm run test:simple path/to/test.js`) for fastest feedback
2. **Frontend Components:** Use Batched Runner (`npm run test:batched:frontend`) or Docker Runner
3. **Full Suite:** Run only before commits (`npm run test:all` or `npm run test:batched`)

See [TEST-STANDARDS.md](./Documentation/TEST-STANDARDS.md) for detailed runner options, configurations, and optimization techniques.

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

### Testing Requirements

- **REQUIRED:** Use the standardized test utilities provided in `frontend/src/__test-utils__`
- Focus on testing behavior, not implementation details
- Follow the project's consistent setup function pattern
- Group tests with descriptive describe blocks
- Mock external dependencies consistently

For detailed testing patterns, examples, and best practices, refer to the documentation listed above rather than duplicating it here.

## Tool Constraints

- **Unable to run Sequelize CLI commands** - When database migrations and seeds need to be executed, prompt the user to run commands like `npx sequelize-cli db:migrate` and `npx sequelize-cli db:seed:all` rather than attempting to run them directly.
- **Auth middleware consistency** - The project uses `authenticateToken` from `auth.js` for all protected routes. Do not use `isAuthenticated` which doesn't exist.

## Critical Quality Rules

- **NEVER bypass or change tests** - Tests are the foundation of our quality control. NEVER modify test expectations to bypass failing tests. Always fix the implementation to make the tests pass correctly. This ensures the application behaves according to the expected behavior.
- **Always run tests before marking a feature as complete** - Before considering a feature implementation complete, run all relevant tests to ensure nothing has been broken.
- **Maintain test accuracy** - Tests must accurately verify expected system behavior. If a test seems wrong, discuss it with the user rather than modifying the test.
```
