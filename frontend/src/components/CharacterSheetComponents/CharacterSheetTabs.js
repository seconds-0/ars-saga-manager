import React, { useState } from 'react';
import VirtuesAndFlawsTab from './VirtuesAndFlawsTab';
import CharacterOverviewTab from './CharacterOverviewTab';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';
import ArtsTab from './ArtsTab';
import SpellsTab from './SpellsTab';
import EquipmentAndCombatTab from './EquipmentAndCombatTab';

const tabs = [
  { name: 'Overview', component: CharacterOverviewTab },
  { name: 'Characteristics & Abilities', component: CharacteristicsAndAbilitiesTab },
  { name: 'Virtues & Flaws', component: VirtuesAndFlawsTab },
  { name: 'Arts', component: ArtsTab },
  { name: 'Spells', component: SpellsTab },
  { name: 'Equipment & Combat', component: EquipmentAndCombatTab },
];

function CharacterSheetTabs({ character }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex border-b">
        {tabs.map((tab, index) => (
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
      <div className="mt-4">
        {React.createElement(tabs[activeTab].component, { character })}
      </div>
    </div>
  );
}

export default CharacterSheetTabs;