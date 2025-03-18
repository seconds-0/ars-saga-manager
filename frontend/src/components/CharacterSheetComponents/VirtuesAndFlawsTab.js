import React, { useMemo } from 'react';
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
    // Guard against undefined character or character type
    if (!character?.type) {
      return null;
    }
    
    return createValidationRules(character.type, {
      allowMajorVirtues: character.type !== 'grog',
      maxVirtuePoints: 10,
      maxMinorFlaws: 5,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      requirePointBalance: true,
      checkCharacterTypeRestrictions: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      house: character.house,
      allowHermeticVirtues: character.hasTheGift,
    });
  }, [character?.type, character?.house, character?.hasTheGift]);

  // Memoize validation result
  const validationResult = useMemo(() => {
    if (!virtuesFlaws || !validationRules) {
      return { isValid: true, warnings: [] };
    }
    return validateVirtuesFlaws(virtuesFlaws, validationRules);
  }, [virtuesFlaws, validationRules]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <VirtueFlawValidationMessages validationResult={validationResult} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Current Virtues and Flaws</h2>
            <CurrentVirtueFlawList
              virtuesFlaws={virtuesFlaws}
              onRemove={removeVirtueFlaw.mutate}
              onSelect={setSelectedVirtueFlaw}
              validationResult={validationResult}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Add Virtue or Flaw</h2>
            <VirtueFlawSelector
              onAdd={(id) => addVirtueFlaw.mutate({ referenceVirtueFlawId: id })}
              remainingPoints={remainingPoints}
              character={character}
              validationResult={validationResult}
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