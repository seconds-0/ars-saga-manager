import React, { useState } from 'react';
import { useVirtuesAndFlaws } from '../../hooks/useVirtuesAndFlaws';
import CurrentVirtueFlawList from './CurrentVirtueFlawList';
import VirtueFlawSelector from './VirtueFlawSelector';
import VirtueFlawDetails from './VirtueFlawDetails';
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ErrorBoundary>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Current Virtues and Flaws</h2>
          <CurrentVirtueFlawList
            virtuesFlaws={virtuesFlaws}
            onRemove={removeVirtueFlaw.mutate}
            onSelect={setSelectedVirtueFlaw}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Add Virtue or Flaw</h2>
          <VirtueFlawSelector
            onAdd={(id) => addVirtueFlaw.mutate({ referenceVirtueFlawId: id })}
            remainingPoints={remainingPoints}
          />
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