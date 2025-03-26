import React from 'react';
import PropTypes from 'prop-types';

function CharacteristicInput({ name, baseValue, onIncrement, onDecrement, cost, disabled = false }) {
  // Determine value styling based on whether it's positive, negative, or zero
  const getValueStyle = (value) => {
    if (value > 0) return "px-4 py-1 bg-green-50 w-12 text-center text-green-700 font-medium";
    if (value < 0) return "px-4 py-1 bg-red-50 w-12 text-center text-red-700 font-medium";
    return "px-4 py-1 bg-gray-100 w-12 text-center text-gray-700";
  };

  // Format cost display for the tooltip
  const getCostDisplay = () => {
    if (!cost) return '';
    
    const sign = onIncrement ? '+' : '-';
    const absValue = Math.abs(cost);
    return `${sign}${absValue} point${absValue !== 1 ? 's' : ''}`;
  };

  return (
    <div className="flex items-center justify-between mb-2 group">
      <span className="w-1/3 font-medium">{name}</span>
      <div className="flex items-center">
        <button
          onClick={onDecrement}
          className={`px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300 ${
            baseValue <= -3 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={baseValue <= -3 || disabled}
          title={baseValue <= -3 ? 'Minimum value reached' : `Decrease (${getCostDisplay()})`}
        >
          -
        </button>
        <span className={getValueStyle(baseValue)}>
          {baseValue > 0 ? `+${baseValue}` : baseValue}
        </span>
        <button
          onClick={onIncrement}
          className={`px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300 ${
            baseValue >= 3 || disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={baseValue >= 3 || disabled}
          title={baseValue >= 3 ? 'Maximum value reached' : `Increase (${getCostDisplay()})`}
        >
          +
        </button>
      </div>
    </div>
  );
}

CharacteristicInput.propTypes = {
  name: PropTypes.string.isRequired,
  baseValue: PropTypes.number.isRequired,
  onIncrement: PropTypes.func.isRequired,
  onDecrement: PropTypes.func.isRequired,
  cost: PropTypes.number,
  disabled: PropTypes.bool
};

export default React.memo(CharacteristicInput);