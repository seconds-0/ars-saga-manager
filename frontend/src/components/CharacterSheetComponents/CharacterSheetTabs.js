import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ErrorBoundary from '../ErrorBoundary';
import VirtuesAndFlawsTab from './VirtuesAndFlawsTab';
import CharacterOverviewTab from './CharacterOverviewTab';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';
import ArtsTab from './ArtsTab';
import SpellsTab from './SpellsTab';
import EquipmentAndCombatTab from './EquipmentAndCombatTab';
import { CharacterProvider } from '../../contexts/CharacterProvider';

const tabs = [
  { name: 'Overview', component: CharacterOverviewTab },
  { name: 'Characteristics & Abilities', component: CharacteristicsAndAbilitiesTab },
  { name: 'Virtues & Flaws', component: VirtuesAndFlawsTab },
  { name: 'Arts', component: ArtsTab },
  { name: 'Spells', component: SpellsTab },
  { name: 'Equipment & Combat', component: EquipmentAndCombatTab },
];

function CharacterSheetTabs({ character, onSave }) {
  const [activeTab, setActiveTab] = useState(0);

  // Determine if character has magical abilities
  const hasMagic = character.character_type?.toLowerCase() === 'magus' || 
                  (character.CharacterVirtueFlaws || [])
                    .some(vf => vf.ReferenceVirtueFlaw?.magical || vf.referenceVirtueFlaw?.magical);
  
  // Filter tabs based on character type
  const visibleTabs = tabs.filter(tab => {
    // Hide Arts tab for non-magical characters
    if (tab.name === 'Arts' && !hasMagic) {
      return false;
    }
    // Hide Spells tab for non-magical characters
    if (tab.name === 'Spells' && !hasMagic) {
      return false;
    }
    return true;
  });

  // Adjust the active tab if it's pointing to a now-hidden tab
  if (activeTab >= visibleTabs.length) {
    setActiveTab(0);
  }

  return (
    <div>
      <div className="flex border-b">
        {visibleTabs.map((tab, index) => (
          <button
            key={index}
            className={`flex-1 py-2 px-4 text-center ${
              activeTab === index ? 'border-b-2 border-blue-500 font-semibold' : ''
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      <ErrorBoundary>
        <CharacterProvider>
          {React.createElement(visibleTabs[activeTab].component, { character, onSave })}
        </CharacterProvider>
      </ErrorBoundary>
    </div>
  );
}

CharacterSheetTabs.propTypes = {
  character: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CharacterSheetTabs;