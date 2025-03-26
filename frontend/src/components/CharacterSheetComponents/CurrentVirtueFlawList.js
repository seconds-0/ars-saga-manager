// frontend/src/components/CharacterSheetComponents/CurrentVirtueFlawList.js

import React from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtueFlawItem = React.memo(({ virtueFlaw, onRemove, onSelect }) => {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-100">
      <div className="flex-grow">
        <span 
          className="cursor-pointer hover:text-blue-700"
          onClick={() => onSelect(virtueFlaw)}
        >
          <span className="font-medium">{virtueFlaw.referenceVirtueFlaw.name}</span>
          {' '}
          <span className="text-sm text-gray-500">
            ({virtueFlaw.referenceVirtueFlaw.size})
          </span>
          {virtueFlaw.referenceVirtueFlaw.category && (
            <span className="text-xs text-gray-500 ml-1">
              {virtueFlaw.referenceVirtueFlaw.category}
            </span>
          )}
        </span>
      </div>
      <button 
        onClick={() => onRemove(virtueFlaw.id)}
        className="text-red-500 hover:text-red-700 ml-4"
        aria-label={`Remove ${virtueFlaw.referenceVirtueFlaw.name}`}
      >
        Remove
      </button>
    </div>
  );
});

function CurrentVirtueFlawList({ virtuesFlaws, onRemove, onSelect }) {
  const Row = ({ index, style }) => {
    const virtueFlaw = virtuesFlaws[index];
    return (
      <div style={style}>
        <VirtueFlawItem
          virtueFlaw={virtueFlaw}
          onRemove={onRemove}
          onSelect={onSelect}
        />
      </div>
    );
  };

  if (!virtuesFlaws.length) {
    return (
      <div className="border rounded p-4 text-center text-gray-500">
        No virtues or flaws selected yet. Add some from the selector on the right.
      </div>
    );
  }

  return (
    <div 
      className="border rounded"
      role="list"
      aria-label="Current virtues and flaws"
    >
      <List
        height={400}
        itemCount={virtuesFlaws.length}
        itemSize={60}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

export default CurrentVirtueFlawList;