import React from 'react';
import PropTypes from 'prop-types';

function AbilityInput({ 
  name, 
  baseValue, 
  effectiveValue = null, 
  specialty = null, 
  onIncrement, 
  onDecrement,
  onSpecialtyChange,
  category,
  disabled = false
}) {
  // If effective value is not provided, use base value
  const displayValue = effectiveValue !== null ? effectiveValue : baseValue;
  
  // Determine if the ability has a bonus from virtues (like Puissant)
  const hasBonus = effectiveValue !== null && effectiveValue > baseValue;
  
  // Define category-based styling
  const getCategoryStyle = () => {
    switch (category) {
      case 'GENERAL':
        return 'bg-gray-100 border-gray-200';
      case 'ACADEMIC':
        return 'bg-blue-50 border-blue-100';
      case 'MARTIAL':
        return 'bg-red-50 border-red-100';
      case 'SUPERNATURAL':
        return 'bg-purple-50 border-purple-100';
      case 'ARCANE':
        return 'bg-green-50 border-green-100';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  // Determine value styling based on the value
  const getValueStyle = () => {
    if (hasBonus) return 'text-green-600 font-semibold';
    if (displayValue === 0) return 'text-gray-600';
    if (displayValue > 0) return 'text-blue-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center p-2 rounded-md border ${getCategoryStyle()} transition-all hover:shadow-sm`}>
      <div className="flex-1 font-medium">
        {name}
        {hasBonus && (
          <span className="text-green-600 text-xs ml-1 bg-green-50 px-1 py-0.5 rounded-full" title="Bonus from virtue or other effect">
            +{effectiveValue - baseValue}
          </span>
        )}
      </div>
      
      <div className="flex items-center mt-1 md:mt-0 space-x-2">
        {/* Specialty input */}
        <input 
          type="text"
          placeholder="Specialty"
          value={specialty || ''}
          onChange={(e) => onSpecialtyChange && onSpecialtyChange(e.target.value)}
          className="p-1 border rounded text-sm w-24 md:w-32 focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:outline-none"
          title="Add a specialty for this ability"
          disabled={disabled}
        />
        
        {/* Value controls */}
        <div className="flex items-center">
          <button 
            onClick={onDecrement}
            className={`bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-l hover:bg-red-600 transition-colors
              ${(baseValue <= 0 || disabled) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Decrease ${name}`}
            disabled={baseValue <= 0 || disabled}
            title={baseValue <= 0 ? "Cannot reduce below 0" : "Decrease value"}
          >
            -
          </button>
          
          <div className={`px-3 py-1 border-t border-b select-none min-w-[32px] text-center ${getValueStyle()}`}>
            {displayValue}
          </div>
          
          <button 
            onClick={onIncrement}
            className={`bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-r hover:bg-blue-600 transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Increase ${name}`}
            disabled={disabled}
            title="Increase value"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

AbilityInput.propTypes = {
  name: PropTypes.string.isRequired,
  baseValue: PropTypes.number.isRequired,
  effectiveValue: PropTypes.number,
  specialty: PropTypes.string,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  onSpecialtyChange: PropTypes.func,
  category: PropTypes.string,
  disabled: PropTypes.bool
};

export default React.memo(AbilityInput);