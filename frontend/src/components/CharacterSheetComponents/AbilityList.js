import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import AbilityInput from './AbilityInput';

// Category display names and order - defined outside component for reference stability
const CATEGORY_CONFIG = [
  { key: 'GENERAL', label: 'General Abilities', icon: '📌' },
  { key: 'ACADEMIC', label: 'Academic Abilities', icon: '📚' },
  { key: 'MARTIAL', label: 'Martial Abilities', icon: '⚔️' },
  { key: 'SUPERNATURAL', label: 'Supernatural Abilities', icon: '✨' },
  { key: 'ARCANE', label: 'Arcane Abilities', icon: '🔮' }
];

function AbilityList({ 
  abilities, 
  onIncrementAbility, 
  onDecrementAbility,
  onIncrementXP,
  onUpdateSpecialty 
}) {
  // Group abilities by category (memoized)
  const groupedAbilities = useMemo(() => {
    return abilities.reduce((groups, ability) => {
      const category = ability.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      
      // Sort within each category by name
      groups[category].push(ability);
      groups[category].sort((a, b) => 
        a.ability_name.localeCompare(b.ability_name)
      );
      
      return groups;
    }, {});
  }, [abilities]);

  // Generate section heading with count and collapsible style
  const renderCategoryHeading = (label, icon, count) => (
    <div className="flex items-center bg-gray-100 p-2 rounded-t-md border-b border-gray-200">
      <span className="mr-2">{icon}</span>
      <h3 className="text-lg font-semibold">{label}</h3>
      <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded-full text-sm text-gray-700">{count}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {CATEGORY_CONFIG.map(({ key, label, icon }) => {
        // Skip categories that have no abilities
        if (!groupedAbilities[key] || groupedAbilities[key].length === 0) {
          return null;
        }

        const categoryAbilities = groupedAbilities[key];
        
        return (
          <div key={key} className="mb-4 border border-gray-200 rounded-md overflow-hidden shadow-sm">
            {renderCategoryHeading(label, icon, categoryAbilities.length)}
            
            <div className="space-y-2 p-2 bg-white">
              {categoryAbilities.map(ability => (
                <AbilityInput
                  key={ability.id}
                  name={ability.ability_name}
                  baseValue={ability.score}
                  effectiveValue={ability.effective_score}
                  experience={ability.experience_points}
                  xpForNextLevel={ability.xp_for_next_level || 5}
                  specialty={ability.specialty}
                  category={ability.category}
                  onIncrement={() => onIncrementAbility(ability.id, ability.score, ability.experience_points)}
                  onDecrement={() => onDecrementAbility(ability.id, ability.score, ability.experience_points)}
                  onIncrementXP={(amount) => onIncrementXP && onIncrementXP(ability.id, ability.experience_points, amount)}
                  onSpecialtyChange={(value) => onUpdateSpecialty(ability.id, value)}
                />
              ))}
            </div>
          </div>
        );
      })}
      
      {(!abilities || abilities.length === 0) && (
        <div className="text-gray-500 italic text-center py-8 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
          <p>No abilities added yet</p>
          <p className="text-sm">Use the selector below to add abilities to your character</p>
        </div>
      )}
    </div>
  );
}

AbilityList.propTypes = {
  abilities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      ability_name: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      effective_score: PropTypes.number,
      experience_points: PropTypes.number,
      xp_for_next_level: PropTypes.number,
      specialty: PropTypes.string,
      category: PropTypes.string.isRequired
    })
  ).isRequired,
  onIncrementAbility: PropTypes.func.isRequired,
  onDecrementAbility: PropTypes.func.isRequired,
  onIncrementXP: PropTypes.func,
  onUpdateSpecialty: PropTypes.func.isRequired
};

export default React.memo(AbilityList);