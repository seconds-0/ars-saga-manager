# Task ID: FEAT-OptimisticUpdates

## Problem Statement
The user interface lacks responsiveness when performing operations that modify character data, particularly when incrementing and decrementing ability scores. Users experience laggy updates in the UI when making changes, especially for the experience point display, which leads to confusion and a poor user experience. Rapid successive operations can cause race conditions or server rate-limiting.

## Components Involved

### Frontend Core Components
- `useAbilities.js` hook
- `useVirtuesAndFlaws.js` hook
- `CharacteristicsAndAbilitiesTab.js` component
- `AbilityList.js` component
- `AbilityInput.js` component
- `CharacterSheet.js` component
- React Query configuration

### Backend Components 
- `abilities.js` routes
- `experienceService.js` service
- `Character.js` model

### State Management
- React Query for server state
- Local component state
- Ref-based throttling/debouncing

## Current Implementation Analysis

### Data Flow Issues
1. **Sequential Pattern**: Currently, the application follows a wait-for-server pattern:
   - User clicks button
   - Frontend sends API request
   - Wait for server response
   - Update UI after server responds
   - This creates latency in the UI feedback loop

2. **XP Update Dependency Chain**:
   - Abilities update → invalidate character query → refetch character data → update XP display
   - This multi-step process leads to delayed updates in the experience display

3. **Rate Limiting Challenges**:
   - Rapid clicks can trigger too many requests (429 errors)
   - Current solution uses ref-based debouncing which helps with rate limits but doesn't improve UI responsiveness

4. **Inconsistent State Management Approaches**:
   - `useAbilities.js`: Uses custom state management with React Query for cache invalidation
   - `useVirtuesAndFlaws.js`: Uses React Query's built-in mutations and query invalidation
   - This inconsistency makes maintenance more difficult

## Optimistic Updates Implementation Plan

### 1. Create Optimistic Update Framework
First, we'll create a reusable optimistic update pattern with consistent error handling and rollback mechanisms.

- [ ] Create a new `useOptimisticUpdate.js` hook in `/frontend/src/hooks/` with:
  - Functions for optimistic updates with automatic rollback
  - Error handling and conflict resolution
  - Loading state tracking
  - Configurable retry logic

### 2. Refactor Character Data Management
We need to create a centralized character data provider that manages optimistic updates across the app.

- [ ] Create a `CharacterProvider.js` context provider in `/frontend/src/contexts/` with:
  - A shared, optimistic character state (including experience points)
  - Methods for optimistically updating character data
  - Loading states and error handling
  - Background synchronization with server

### 3. Refactor Ability Management
Update ability-related components to use optimistic updates.

- [ ] Refactor `useAbilities.js` hook:
  - Implement optimistic state updates for increments/decrements
  - Calculate experience changes locally before server confirmation
  - Handle conflicts between optimistic and server state
  - Pre-validate operations based on local state
  - Add loading indicators for individual abilities during pending operations

- [ ] Update `AbilityInput.js` component:
  - Add loading state visual feedback during operations
  - Disable appropriate controls during pending operations
  - Maintain responsive UI during background synchronization

### 4. Update Experience Point Display
Make experience point displays immediately reflect changes.

- [ ] Modify `CharacteristicsAndAbilitiesTab.js`:
  - Use optimistic character state for XP display
  - Visually indicate pending operations (e.g., grayed out or with spinner)
  - Add tooltip showing pending vs. confirmed values

### 5. Implement Similar Patterns for Other Features
Apply the optimistic update pattern to other mutable features.

- [ ] Refactor `useVirtuesAndFlaws.js` to use optimistic updates
- [ ] Update characteristic changes to use optimistic updates
- [ ] Apply pattern to any other interactive features (arts, spells, etc.)

### 6. Add Visual Feedback Enhancements
Improve user feedback throughout the optimistic update cycle.

- [ ] Create reusable visual components for optimistic state:
  - Success indicators
  - Pending operation indicators
  - Rollback animations
  - Error notifications that don't block the UI

### 7. Test Suite Updates
Update and expand tests to cover optimistic update functionality.

- [ ] Create new test utilities for optimistic updates
- [ ] Update existing tests to account for optimistic state changes
- [ ] Add tests for error scenarios and rollbacks
- [ ] Test for race conditions and concurrent updates

## Technical Implementation Details

### 1. Character State Management
Create a central state management solution with optimistic updates:

```javascript
// In CharacterProvider.js
const CharacterContext = createContext();

export function CharacterProvider({ children }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  // Server state via React Query
  const { data: serverCharacter, isLoading, error } = useQuery(['character', id], fetchCharacter);
  
  // Optimistic state
  const [optimisticCharacter, setOptimisticCharacter] = useState(null);
  const [pendingOperations, setPendingOperations] = useState([]);
  
  // Sync optimistic state with server state when it changes
  useEffect(() => {
    if (serverCharacter && !isEqual(serverCharacter, optimisticCharacter)) {
      setOptimisticCharacter(serverCharacter);
    }
  }, [serverCharacter]);
  
  // Optimistic update function
  const updateCharacterOptimistically = useCallback((updateFn, metadata) => {
    // Generate operation ID
    const operationId = uuidv4();
    
    // Apply optimistic update
    setOptimisticCharacter(currentState => updateFn(currentState));
    
    // Track pending operation
    setPendingOperations(ops => [...ops, { id: operationId, metadata }]);
    
    // Perform actual API call
    return api.put(`/characters/${id}`, metadata.serverUpdateData)
      .then(response => {
        // Remove from pending operations on success
        setPendingOperations(ops => ops.filter(op => op.id !== operationId));
        // Server update happened, let React Query handle the cache
        queryClient.invalidateQueries(['character', id]);
        return response;
      })
      .catch(error => {
        // Rollback optimistic update on error
        setOptimisticCharacter(serverCharacter);
        setPendingOperations(ops => ops.filter(op => op.id !== operationId));
        throw error;
      });
  }, [id, serverCharacter, queryClient]);
  
  // Value to provide
  const value = {
    character: optimisticCharacter || serverCharacter,
    isLoading,
    error,
    pendingOperations,
    updateCharacterOptimistically
  };
  
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}
```

### 2. Optimistic Ability Updates
Refactor the ability operations to use optimistic updates:

```javascript
// In useAbilities.js
function useAbilities(characterId) {
  const { character, updateCharacterOptimistically } = useCharacter(); // From our new context
  const [abilities, setAbilities] = useState([]);
  const [pendingAbilityOperations, setPendingAbilityOperations] = useState({});
  
  // Rest of the hook...
  
  const incrementAbility = async (abilityId, currentScore, currentXP) => {
    // Find ability
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return false;
    
    // Calculate new values
    const targetScore = currentScore + 1;
    const targetXP = calculateXPForTargetScore(targetScore);
    const xpNeeded = targetXP - currentXP;
    
    // Check if we have enough XP
    const availableXP = calculateAvailableXP(character, ability);
    if (availableXP < xpNeeded) {
      return { success: false, error: `Not enough XP (${availableXP} available, ${xpNeeded} needed)` };
    }
    
    // Mark operation as pending
    setPendingAbilityOperations(prev => ({
      ...prev,
      [abilityId]: { type: 'increment', timestamp: Date.now() }
    }));
    
    // Optimistically update local abilities state
    setAbilities(prevAbilities => 
      prevAbilities.map(a => 
        a.id === abilityId 
          ? { ...a, score: targetScore, experience_points: targetXP } 
          : a
      )
    );
    
    // Optimistically update character XP
    updateCharacterOptimistically(
      // Update function for optimistic state
      (char) => ({
        ...char,
        general_exp_available: char.general_exp_available - xpNeeded
      }),
      // Metadata including server update data
      {
        serverUpdateData: { general_exp_available: character.general_exp_available - xpNeeded },
        operationType: 'incrementAbility',
        abilityId
      }
    );
    
    // Make actual API call in background
    try {
      const response = await api.put(`/characters/${characterId}/abilities/${abilityId}`, { 
        experience_points: targetXP 
      });
      
      // Clear pending state on success
      setPendingAbilityOperations(prev => {
        const { [abilityId]: _, ...rest } = prev;
        return rest;
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      // Rollback on error
      setAbilities(prevAbilities => 
        prevAbilities.map(a => 
          a.id === abilityId 
            ? { ...a, score: currentScore, experience_points: currentXP } 
            : a
        )
      );
      
      // Clear pending state
      setPendingAbilityOperations(prev => {
        const { [abilityId]: _, ...rest } = prev;
        return rest;
      });
      
      return { success: false, error: error.message };
    }
  };
  
  // Similar optimistic implementation for other operations...
  
  return {
    abilities,
    pendingAbilityOperations,
    // other state and functions...
    incrementAbility,
    decrementAbility
  };
}
```

### 3. UI Feedback for Optimistic Updates

```jsx
// In AbilityInput.js
function AbilityInput({ 
  /* existing props */,
  isPending = false 
}) {
  // Rest of component...
  
  return (
    <div className={`${getCategoryStyle()} ${isPending ? 'opacity-70' : ''}`}>
      {/* Ability name with pending indicator if needed */}
      <div className="flex-1 font-medium">
        {name}
        {isPending && (
          <span className="ml-2 text-xs text-blue-500">
            <Spinner size="xs" /> Saving...
          </span>
        )}
      </div>
      
      {/* Score controls with pending state */}
      <button 
        onClick={onIncrement}
        disabled={disabled || isPending}
        className={`${isPending ? 'cursor-wait' : ''}`}
      >
        +
      </button>
      
      {/* etc... */}
    </div>
  );
}

// In AbilityList.js
function AbilityList({ abilities, pendingOperations, /* other props */ }) {
  return (
    <div>
      {abilities.map(ability => (
        <AbilityInput
          key={ability.id}
          // other props...
          isPending={!!pendingOperations[ability.id]}
        />
      ))}
    </div>
  );
}
```

### 4. Experience Display with Optimistic Updates

```jsx
// In CharacteristicsAndAbilitiesTab.js
function ExperienceDisplay({ character, pendingOperations = [] }) {
  // Calculate total pending XP changes
  const pendingXpChanges = pendingOperations.reduce((total, op) => {
    if (op.metadata.operationType === 'incrementAbility') {
      return total - op.metadata.xpCost;
    } else if (op.metadata.operationType === 'decrementAbility') {
      return total + op.metadata.xpRefund;
    }
    return total;
  }, 0);
  
  // Effective values including pending changes
  const effectiveGeneralXp = character.general_exp_available + pendingXpChanges;
  
  return (
    <div className="flex items-center">
      <div className="bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
        <span className="font-medium text-blue-700">General XP:</span>
        <span className="ml-1">{effectiveGeneralXp}</span>
        
        {pendingXpChanges !== 0 && (
          <span className="ml-1 text-xs text-gray-500">
            {pendingXpChanges > 0 ? '+' : ''}{pendingXpChanges} pending
          </span>
        )}
      </div>
      {/* Render other XP pools similarly */}
    </div>
  );
}
```

## Test Updates Required

1. **Component Tests**:
   - Update AbilityInput tests to include pending state rendering
   - Add tests for optimistic state values in UI
   - Test rollback scenarios
   - Update useAbilities.test.js to cover optimistic updates

2. **Integration Tests**:
   - Test experience point calculations during optimistic updates
   - Verify UI reflects pending operations
   - Test multiple simultaneous operations

3. **Hook Tests**:
   - Create tests for new `useOptimisticUpdate` hook
   - Update tests for modified hooks
   - Test error handling and rollback functionality

4. **Context Tests**:
   - Create tests for CharacterProvider
   - Test state sharing between components

## Decision Authority
- I can implement the optimistic update framework and refactor the core components
- Will consult on UI feedback design choices if needed

## Questions/Uncertainties

### Blocking
- None

### Non-blocking
- The current backend implementation should support optimistic updates without changes, but we should monitor for any potential issues with concurrent updates
- Need to evaluate proper debounce/throttle timings for optimal UX

## Acceptable Tradeoffs
- May occasionally display stale data if the network request fails silently
- Slight increase in code complexity to handle optimistic state
- Small increase in memory usage from duplicate state tracking

## Status
Not Started

## Notes
- Use appropriate loading spinners and visual feedback to indicate pending operations
- Consider adding Tanstack Query's (React Query) useMutation hook's built-in optimistic update features where appropriate
- Implement staggered retry logic for failed operations
- Add console logging in development for debugging optimistic update lifecycle