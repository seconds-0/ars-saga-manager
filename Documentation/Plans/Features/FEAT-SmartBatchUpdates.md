# Smart Batch Updates Implementation Plan

## Task ID: FEAT-SmartBatchUpdates

## Problem Statement
The application is experiencing 429 "Too Many Requests" errors during normal user interaction when users click increment/decrement buttons on abilities at a normal speed. These rate limit errors impact user experience, break the optimistic update pattern, and lead to inconsistent UI state.

## Components Involved
1. **Backend API**
   - Rate limiting middleware
   - Character ability routes
   - Ability controllers

2. **Frontend Components**
   - Character provider/context
   - useAbilities hook
   - AbilityInput component
   - Optimistic updates implementation
   - API request handling

3. **Shared Models**
   - Character model
   - Abilities model
   - API request/response formats

## Dependencies
- Existing optimistic updates pattern
- Current API rate limiting configuration
- Existing abilities update API endpoints

## Implementation Checklist

### 1. Backend Batch API Implementation
- [ ] Create new batch API endpoint in `/routes/abilities.js`: `/api/characters/:id/abilities/batch`
- [ ] Implement controller function in backend to handle batch updates
- [ ] Add request validation for batch operations (array of valid operations)
- [ ] Implement transaction handling for all-or-nothing updates
- [ ] Add comprehensive error handling and detailed response structure
- [ ] Write tests for batch API endpoint

### 2. Frontend Smart Request Handler
- [ ] Create a new utility: `useBatchRequests.js` hook
- [ ] Implement request batching logic with configurable collection window (150-200ms)
- [ ] Add intelligent merging of sequential operations on same resource
- [ ] Ensure proper handling of dependencies between operations
- [ ] Implement queuing mechanism for requests exceeding rate limits

### 3. Integration with Existing Optimistic Updates
- [ ] Modify CharacterProvider to use new batch request handler
- [ ] Update useAbilities hook to work with batch operations
- [ ] Maintain existing optimistic UI updates while using new batching system
- [ ] Enhance error handling and rollback for batch operations

### 4. Additional Areas for Implementation
- [ ] Update character Virtues/Flaws interactions to use batch pattern
- [ ] Apply pattern to arts updates if applicable
- [ ] Consider implementation for character general attribute updates

### 5. Testing and Validation
- [ ] Add unit tests for new batching logic
- [ ] Add integration tests for batch API endpoints
- [ ] Test high-frequency update scenarios
- [ ] Verify proper error handling and recovery
- [ ] Measure performance improvement vs. current implementation

## Verification Steps
1. Manual testing of rapid ability score increment/decrement
2. Verify no 429 errors occur during normal/fast usage patterns
3. Confirm network tab shows fewer API calls being made
4. Verify state consistency between UI and database after batch operations
5. Test error scenarios (network failure, validation errors)

## Decision Authority
- **Independent Decisions**: Implementation details of batching mechanism, timing parameters, utility structure
- **User Input Required**: Significant changes to existing API contracts, changes affecting other planned features

## Questions/Uncertainties

### Blocking
- What is the current rate limit configuration on the backend? (Request analysis of middleware settings)
- Should batch operations count as a single request for rate limiting purposes?

### Non-blocking
- Optimal collection window timing (can start with 150ms and adjust based on testing)
- Best approach for handling interleaved operations on different resources (can implement simple version first)

## Acceptable Tradeoffs
- Slightly increased complexity in request handling for significantly improved reliability
- Small delay in actual persistence (while maintaining immediate UI updates)
- Additional code to maintain for improved user experience

## Status
Not Started

## Notes
- This pattern will establish a foundation for efficient API interaction that can be applied to other high-frequency update areas in the application
- The implementation should be designed to be reusable across different resource types

## Detailed Implementation Guide

### Backend Batch API Design

#### Request Format
```json
{
  "operations": [
    {
      "abilityId": 4,
      "action": "increment", // or "decrement", "update"
      "data": {
        "score": 5,
        "experience_points": 75
      }
    },
    {
      "abilityId": 7,
      "action": "decrement",
      "data": {
        "score": 2,
        "experience_points": 20
      }
    }
  ]
}
```

#### Response Format
```json
{
  "status": "success",
  "results": [
    {
      "abilityId": 4,
      "action": "increment",
      "success": true,
      "data": {
        "id": 4,
        "ability_name": "Area Lore",
        "score": 5,
        "effective_score": 6,
        "experience_points": 75
      }
    },
    {
      "abilityId": 7,
      "action": "decrement",
      "success": true,
      "data": {
        "id": 7,
        "ability_name": "Athletics",
        "score": 2,
        "effective_score": 2,
        "experience_points": 20
      }
    }
  ]
}
```

### Frontend Batch Request Hook

The `useBatchRequests` hook will provide:

1. A collection mechanism that groups rapid sequential operations
2. Smart merging of operations on the same resource (only send final state)
3. Batch submission to new batch API endpoint
4. Handling of successes and failures at the individual operation level

### Integration with Existing Optimistic Updates

The new system will maintain the existing optimistic update pattern:
1. Immediately update UI state
2. Queue the actual API request
3. Resolve or rollback based on server response

The difference is that the actual API requests will be intelligently batched.

### Cross-Cutting Implementation Areas

This pattern should also be applied to:

1. **Arts Updates**: Similar to abilities, arts can benefit from the same batching mechanism
2. **Virtues/Flaws Updates**: When adding/removing multiple virtues/flaws
3. **Character Attribute Updates**: When changing multiple character attributes at once

## Architecture Design Principles

1. **Separation of Concerns**:
   - Batching logic separate from UI components
   - Clear API contracts for batch operations

2. **Progressive Enhancement**:
   - System degrades gracefully if batching fails
   - Individual operations can still succeed

3. **Intelligent Request Management**:
   - Coalescing of rapid updates to same resource
   - Prioritization of updates in queue

4. **Comprehensive Testing**:
   - Unit tests for batching logic
   - Integration tests for batch API
   - Load testing to verify rate limit handling