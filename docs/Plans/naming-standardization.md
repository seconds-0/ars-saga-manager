# Property Naming Standardization Plan

## Current State Assessment

The Ars Saga Manager application currently uses mixed naming conventions:

- **Backend API** returns data with **snake_case** properties (character_type, has_the_gift, house_id)
- **Frontend React components** traditionally use **camelCase** (characterType, hasTheGift, houseId)
- Current codebase has accommodations for both styles, leading to complexity

## Standardization Decision

After careful analysis, the best approach is to:

1. **Standardize on camelCase for all frontend code**
2. **Create a data transformation layer at API boundaries**
3. **Implement gradually to minimize disruption**

This approach:

- Follows React/JavaScript conventions (camelCase)
- Maintains clean separation between backend and frontend conventions
- Allows for incremental implementation

## Implementation Plan

### 1. Create Transformation Utilities

Create a utility function in the API layer to transform snake_case to camelCase:

```javascript
// api/transform.js
export function camelizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelizeKeys(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [camelCase(key)]: camelizeKeys(obj[key]),
      }),
      {}
    );
  }
  return obj;
}

function camelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
```

### 2. Apply Transformation at API Boundaries

Modify the axios instance to automatically transform all responses:

```javascript
// api/axios.js
import axios from "axios";
import { camelizeKeys } from "./transform";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api",
  timeout: 10000,
});

// Response interceptor - transform all responses to camelCase
api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = camelizeKeys(response.data);
  }
  return response;
});

export default api;
```

### 3. Update Component Code

The update process will follow this pattern:

1. New code will exclusively use camelCase
2. Existing code will be updated as files are touched
3. The dual property access pattern will be maintained during transition

### 4. Documentation Updates

Update CLAUDE.md with the standardized naming convention:

```
## Code Style Guidelines
- **Property Naming**:
  - All frontend property names should use camelCase
  - API responses are transformed from snake_case to camelCase at the boundary
  - Backend continues to use snake_case as per RESTful API conventions
```

### 5. Testing Strategy

1. Add tests for the transformation utility
2. Update existing tests to use camelCase consistently
3. Add integration tests to verify API transformation works correctly

## Implementation Timeline

1. **Immediate (Current PR)**

   - Create and implement the transformation utility
   - Update existing dual-format code to prefer camelCase

2. **Short-term (Next 2-3 PRs)**

   - Update all component props and interfaces to camelCase
   - Add tests for transformation utility

3. **Ongoing**
   - Convert remaining code as files are touched
   - Remove dual-format checks once codebase is fully migrated

## Benefits of This Approach

1. **Developer Experience**: Follows JavaScript/React conventions
2. **Code Clarity**: Removes need for dual property checks
3. **Maintainability**: Single convention throughout frontend code
4. **Gradual Migration**: Minimizes risk of breaking changes
5. **Separation of Concerns**: Backend and frontend can maintain their own conventions

## Decision Note

This standardization makes working with the codebase more predictable and maintainable. The transformation happens at the API boundary, which is an industry best practice, allowing both frontend and backend to use conventions appropriate to their languages/frameworks.!
