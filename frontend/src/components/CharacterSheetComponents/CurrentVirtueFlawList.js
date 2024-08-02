// frontend/src/components/CharacterSheetComponents/CurrentVirtueFlawList.js

import React from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtueFlawItem = React.memo(({ virtueFlaw, onRemove, onSelect }) => (
  <div className="flex justify-between items-center p-2 hover:bg-gray-100">
    <span 
      className="cursor-pointer"
      onClick={() => onSelect(virtueFlaw)}
    >
      {virtueFlaw.referenceVirtueFlaw.name} ({virtueFlaw.referenceVirtueFlaw.size})
    </span>
    <button 
      onClick={() => onRemove(virtueFlaw.id)}
      className="text-red-500 hover:text-red-700"
    >
      Remove
    </button>
  </div>
));

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

  return (
    <List
      height={400}
      itemCount={virtuesFlaws.length}
      itemSize={35}
      width="100%"
    >
      {Row}
    </List>
  );
}

export default CurrentVirtueFlawList;