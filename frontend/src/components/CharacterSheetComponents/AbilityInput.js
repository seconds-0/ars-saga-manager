import React, { useState } from 'react';
import PropTypes from 'prop-types';

function AbilityInput({ 
  name, 
  baseValue, 
  effectiveValue = null, 
  experience = 0,
  xpForNextLevel = 0,
  specialty = null, 
  onIncrement, 
  onDecrement,
  onIncrementXP,
  onSpecialtyChange,
  category,
  disabled = false,
  isPendingIncrement = false,
  isPendingDecrement = false,
  isPendingXP = false
}) {
  const [showXP, setShowXP] = useState(false);
  
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
  
  // Toggle between showing score and XP
  const toggleShowXP = () => {
    setShowXP(prev => !prev);
  };

  // Determine if any operation is pending
  const isAnyOperationPending = isPendingIncrement || isPendingDecrement || isPendingXP;

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center p-2 rounded-md border ${getCategoryStyle()} transition-all hover:shadow-sm ${isAnyOperationPending ? 'bg-opacity-70' : ''}`}>
      <div className="flex-1 font-medium">
        {name}
        {hasBonus && (
          <span className="text-green-600 text-xs ml-1 bg-green-50 px-1 py-0.5 rounded-full" title="Bonus from virtue or other effect">
            +{effectiveValue - baseValue}
          </span>
        )}
        {isAnyOperationPending && (
          <span className="text-blue-600 text-xs ml-1 bg-blue-50 px-1 py-0.5 rounded-full animate-pulse" title="Operation in progress">
            Updating...
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
          disabled={disabled || isAnyOperationPending}
        />
        
        {/* Value controls */}
        <div className="flex flex-col">
          {/* Value/XP toggle */}
          <div 
            className="text-xs text-gray-500 mb-1 text-center cursor-pointer hover:text-blue-500 transition-colors"
            onClick={toggleShowXP}
            title={showXP ? "Show ability score" : "Show experience points"}
          >
            {showXP ? `${experience} XP` : `Score: ${displayValue}`}
            {xpForNextLevel > 0 && showXP && (
              <span className="ml-1">(+{xpForNextLevel} for next level)</span>
            )}
          </div>
          
          <div className="flex items-center">
            {showXP ? (
              // XP controls
              <>
                <button 
                  onClick={() => !isPendingXP && onIncrementXP && onIncrementXP(1)}
                  className={`relative bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-l hover:bg-blue-600 transition-colors
                    ${(disabled || isPendingXP) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Add 1 XP to ${name}`}
                  disabled={disabled || isPendingXP}
                  title="Add 1 XP"
                >
                  {isPendingXP ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : "+1"}
                </button>
                
                <div className={`px-3 py-1 border-t border-b select-none min-w-[32px] text-center ${isPendingXP ? 'bg-blue-50 text-blue-600' : ''}`}>
                  {experience} XP
                </div>
                
                <button 
                  onClick={() => !isPendingXP && onIncrementXP && onIncrementXP(xpForNextLevel)}
                  className={`relative bg-green-500 text-white w-10 h-6 flex items-center justify-center rounded-r hover:bg-green-600 transition-colors text-xs
                    ${(disabled || isPendingXP) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Add XP for next level to ${name}`}
                  disabled={disabled || isPendingXP}
                  title={`Add ${xpForNextLevel} XP to reach next level`}
                >
                  {isPendingXP ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : `+${xpForNextLevel}`}
                </button>
              </>
            ) : (
              // Score controls
              <>
                <button 
                  onClick={() => !isPendingDecrement && onDecrement()}
                  className={`relative bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-l hover:bg-red-600 transition-colors
                    ${(baseValue <= 0 || disabled || isPendingDecrement || isPendingIncrement) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Decrease ${name}`}
                  disabled={baseValue <= 0 || disabled || isPendingDecrement || isPendingIncrement}
                  title={baseValue <= 0 ? "Cannot reduce below 0" : "Decrease value"}
                >
                  {isPendingDecrement ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : "-"}
                </button>
                
                <div className={`px-3 py-1 border-t border-b select-none min-w-[32px] text-center ${getValueStyle()} ${isPendingDecrement || isPendingIncrement ? 'bg-blue-50' : ''}`}>
                  {displayValue}
                  {(isPendingDecrement || isPendingIncrement) && (
                    <span className="inline-block ml-1 h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                
                <button 
                  onClick={() => !isPendingIncrement && onIncrement()}
                  className={`relative bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-r hover:bg-blue-600 transition-colors
                    ${(disabled || isPendingIncrement || isPendingDecrement) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label={`Increase ${name}`}
                  disabled={disabled || isPendingIncrement || isPendingDecrement}
                  title="Increase value"
                >
                  {isPendingIncrement ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : "+"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

AbilityInput.propTypes = {
  name: PropTypes.string.isRequired,
  baseValue: PropTypes.number.isRequired,
  effectiveValue: PropTypes.number,
  experience: PropTypes.number,
  xpForNextLevel: PropTypes.number,
  specialty: PropTypes.string,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  onIncrementXP: PropTypes.func,
  onSpecialtyChange: PropTypes.func,
  category: PropTypes.string,
  disabled: PropTypes.bool,
  isPendingIncrement: PropTypes.bool,
  isPendingDecrement: PropTypes.bool,
  isPendingXP: PropTypes.bool
};

export default React.memo(AbilityInput);