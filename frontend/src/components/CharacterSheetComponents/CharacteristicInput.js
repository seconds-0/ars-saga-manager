import React from 'react';

function CharacteristicInput({ name, baseValue, onIncrement, onDecrement }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="w-1/3 font-medium">{name}</span>
      <div className="flex items-center">
        <button
          onClick={onDecrement}
          className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
        >
          -
        </button>
        <span className="px-4 py-1 bg-gray-100 w-12 text-center">
          {baseValue}
        </span>
        <button
          onClick={onIncrement}
          className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default CharacteristicInput;