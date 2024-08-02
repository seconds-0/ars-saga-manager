import React from 'react';
import PropTypes from 'prop-types';

function VirtueFlawList({ items, onRemove, emptyMessage }) {
  if (items.length === 0) {
    return (
      <div className="border p-4 h-64 overflow-y-auto">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const groupedItems = items.reduce((acc, item) => {
    const key = `${item.name}-${item.size}`;
    if (acc[key]) {
      acc[key].count += 1;
    } else {
      acc[key] = { ...item, count: 1 };
    }
    return acc;
  }, {});

  return (
    <div className="border p-4 h-64 overflow-y-auto">
      {Object.values(groupedItems).map((item) => (
        <div key={item.id} className="flex justify-between items-center mb-2">
          <span className="flex-grow">
            {item.name} ({item.size}) {item.count > 1 ? `x ${item.count}` : ''}
          </span>
          <span className="mx-2 text-sm text-gray-500">
            {item.size === 'Major' ? '3 pts' : '1 pt'}
          </span>
          <button 
            onClick={() => onRemove(item.id)}
            className="text-red-500 hover:text-red-700 ml-2"
            title="Remove"
          >
            X
          </button>
        </div>
      ))}
    </div>
  );
}

VirtueFlawList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.oneOf(['Minor', 'Major', 'Free']).isRequired,
      type: PropTypes.oneOf(['Virtue', 'Flaw']).isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  emptyMessage: PropTypes.string.isRequired,
};

export default VirtueFlawList;