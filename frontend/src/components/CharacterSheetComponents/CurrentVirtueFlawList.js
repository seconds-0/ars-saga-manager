// frontend/src/components/CharacterSheetComponents/CurrentVirtueFlawList.js

import React from 'react';
import { FixedSizeList as List } from 'react-window';

const VirtueFlawItem = React.memo(({ virtueFlaw, onRemove, onSelect, warnings = [] }) => {
  const itemWarnings = warnings.filter(w => 
    w.message.toLowerCase().includes(virtueFlaw.referenceVirtueFlaw.name.toLowerCase())
  );

  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-100">
      <div className="flex-grow">
        <span 
          className="cursor-pointer"
          onClick={() => onSelect(virtueFlaw)}
        >
          {virtueFlaw.referenceVirtueFlaw.name} ({virtueFlaw.referenceVirtueFlaw.size})
        </span>
        {itemWarnings.length > 0 && (
          <div className="text-xs text-red-500 mt-1">
            {itemWarnings.map((warning, idx) => (
              <div key={idx}>{warning.message}</div>
            ))}
          </div>
        )}
      </div>
      <button 
        onClick={() => onRemove(virtueFlaw.id)}
        className="text-red-500 hover:text-red-700 ml-4"
      >
        Remove
      </button>
    </div>
  );
});

function CurrentVirtueFlawList({ virtuesFlaws, onRemove, onSelect, validationResult }) {
  const Row = ({ index, style }) => {
    const virtueFlaw = virtuesFlaws[index];
    return (
      <div style={style}>
        <VirtueFlawItem
          virtueFlaw={virtueFlaw}
          onRemove={onRemove}
          onSelect={onSelect}
          warnings={validationResult?.warnings || []}
        />
      </div>
    );
  };

  return (
    <List
      height={400}
      itemCount={virtuesFlaws.length}
      itemSize={60}
      width="100%"
      className="border rounded"
    >
      {Row}
    </List>
  );
}

export default CurrentVirtueFlawList;