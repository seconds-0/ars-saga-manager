import React, { useMemo, useCallback } from 'react';
import { useVirtuesAndFlaws } from '../../hooks/useVirtuesAndFlaws';
import CurrentVirtueFlawList from './CurrentVirtueFlawList';
import VirtueFlawSelector from './VirtueFlawSelector';
import VirtueFlawDetails from './VirtueFlawDetails';
import VirtueFlawValidationMessages from './VirtueFlawValidationMessages';
import { validateVirtuesFlaws, createValidationRules } from '../../utils/virtueFlawValidation';
import ErrorBoundary from '../ErrorBoundary';

function VirtuesAndFlawsTab({ character }) {
  const {
    virtuesFlaws,
    remainingPoints,
    isLoading,
    error,
    addVirtueFlaw,
    removeVirtueFlaw,
  } = useVirtuesAndFlaws(character.id);

  const [selectedVirtueFlaw, setSelectedVirtueFlaw] = React.useState(null);

  // Memoize validation rules
  const validationRules = useMemo(() => {
    return createValidationRules(character.character_type, {
      allowMajorVirtues: character.character_type !== 'grog',
      maxVirtuePoints: 10,
      maxMinorFlaws: 5,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      requirePointBalance: true,
      checkCharacterTypeRestrictions: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
    });
  }, [character.character_type]);

  // Memoize validation result
  const validationResult = useMemo(() => {
    if (!virtuesFlaws) {
      return { isValid: true, warnings: [] };
    }
    return validateVirtuesFlaws(virtuesFlaws, validationRules);
  }, [virtuesFlaws, validationRules]);

  // Find and select a virtue/flaw by ID when clicking on a validation message
  const handleSelectVirtueFlawFromError = useCallback((virtueFlawId) => {
    const virtueFlaw = virtuesFlaws.find(vf => vf.id === virtueFlawId);
    if (virtueFlaw) {
      setSelectedVirtueFlaw(virtueFlaw);
    }
  }, [virtuesFlaws]);

  // Function to check if a virtue/flaw can be added (extracted from VirtueFlawSelector)
  const canAddVirtueFlaw = useCallback((virtueFlaw) => {
    if (!character?.character_type || !validationRules) return false;
    
    // House virtues are always available if they match the character's house
    if (virtueFlaw.is_house_virtue && virtueFlaw.house === character.house) {
      return true;
    }
    
    // Create a temporary list with the new virtue/flaw added
    const tempVirtuesFlaws = [
      ...(virtuesFlaws || []),
      {
        referenceVirtueFlaw: virtueFlaw,
        is_house_virtue_flaw: false,
      }
    ];
    
    // Validate the temporary list
    const result = validateVirtuesFlaws(tempVirtuesFlaws, validationRules);
    
    // Check if adding this virtue/flaw would make the character invalid
    const isValid = result.isValid || result.warnings.every(w => w.type !== 'error');
    
    // Check for point constraints
    const hasEnoughPoints = virtueFlaw.type !== 'Virtue' || 
      (virtueFlaw.size === 'Minor' && remainingPoints >= 1) || 
      (virtueFlaw.size === 'Major' && remainingPoints >= 3);
    
    return isValid && hasEnoughPoints;
  }, [character, validationRules, virtuesFlaws, remainingPoints]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        {/* Centralized validation messages with ability to select items */}
        <VirtueFlawValidationMessages 
          validationResult={validationResult} 
          onSelectVirtueFlaw={handleSelectVirtueFlawFromError}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Current Virtues and Flaws</h2>
            <CurrentVirtueFlawList
              virtuesFlaws={virtuesFlaws}
              onRemove={removeVirtueFlaw.mutate}
              onSelect={setSelectedVirtueFlaw}
              // No longer passing validationResult to avoid duplicate error displays
            />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Add Virtue or Flaw</h2>
            <VirtueFlawSelector
              onAdd={(id) => addVirtueFlaw.mutate({ referenceVirtueFlawId: id })}
              remainingPoints={remainingPoints}
              character={character}
              canAddVirtueFlaw={canAddVirtueFlaw}
              // No longer passing validationResult to avoid duplicate error displays 
            />
          </div>
        </div>
      </div>
      
      {selectedVirtueFlaw && (
        <VirtueFlawDetails
          virtueFlaw={selectedVirtueFlaw}
          onClose={() => setSelectedVirtueFlaw(null)}
          characterId={character.id}
        />
      )}
    </ErrorBoundary>
  );
}

export default VirtuesAndFlawsTab;