import React from 'react';
import PropTypes from 'prop-types';

function VirtueFlawList({ virtuesFlaws, onRemove }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Current Virtues & Flaws</h3>
      {virtuesFlaws.map(vf => (
        <div key={vf.id} className="flex justify-between items-center mb-2">
          <span>{vf.name} ({vf.size})</span>
          <button 
            onClick={() => onRemove(vf.id)}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

VirtueFlawList.propTypes = {
  virtuesFlaws: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default VirtueFlawList;