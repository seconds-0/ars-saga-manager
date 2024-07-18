import React, { useState } from 'react';
import CharacterOverviewTab from './CharacterOverviewTab';
import VirtuesAndFlawsTab from './VirtuesAndFlawsTab';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';
import ArtsTab from './ArtsTab';
import SpellsTab from './SpellsTab';
import EquipmentAndCombatTab from './EquipmentAndCombatTab';

const tabs = [
  { name: 'Overview', component: CharacterOverviewTab },
  { name: 'Virtues & Flaws', component: VirtuesAndFlawsTab },
  { name: 'Characteristics & Abilities', component: CharacteristicsAndAbilitiesTab },
  { name: 'Arts', component: ArtsTab },
  { name: 'Spells', component: SpellsTab },
  { name: 'Equipment & Combat', component: EquipmentAndCombatTab },
];

function CharacterSheetTabs({ character, onSave }) {
  const [activeTab, setActiveTab] = useState(0);

  const ActiveTabComponent = tabs[activeTab].component;

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              className={`${
                activeTab === index
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab(index)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        <ActiveTabComponent character={character} onSave={onSave} />
      </div>
    </div>
  );
}

export default CharacterSheetTabs;
