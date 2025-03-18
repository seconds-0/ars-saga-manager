import React from 'react';
import PropTypes from 'prop-types';

function VirtueFlawList({ items = [], onRemove, onSelect, emptyMessage = "No virtues or flaws selected." }) {
  if (!items || items.length === 0) {
    return (
      <div className="border p-4 h-64 overflow-y-auto">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Convert the items to a simpler format if they're in the database format
  const normalizedItems = items.map(item => {
    if (item.referenceVirtueFlaw) {
      return {
        id: item.id,
        name: item.referenceVirtueFlaw.name,
        size: item.referenceVirtueFlaw.size,
        type: item.referenceVirtueFlaw.type,
        category: item.referenceVirtueFlaw.category,
        isHouse: item.is_house_virtue_flaw
      };
    }
    return item;
  });

  // Group by category for display
  const groupedByCategory = normalizedItems.reduce((acc, item) => {
    const category = item.category || 'Unknown';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="border p-4 h-64 overflow-y-auto" data-testid="virtue-flaw-list">
      {Object.entries(groupedByCategory).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="font-bold mt-2 mb-1">{category}</h3>
          {categoryItems.map((item) => (
            <div 
              key={item.id} 
              className="flex justify-between items-center mb-2"
              role="listitem"
              data-testid={`virtue-flaw-item-${item.id}`}
            >
              <span 
                className="flex-grow cursor-pointer"
                onClick={() => onSelect && onSelect(item)}
                data-testid={`virtue-flaw-name-${item.id}`}
              >
                {item.name} ({item.size})
              </span>
              {item.isHouse && (
                <span className="text-green-600 text-xs mr-2">House</span>
              )}
              <span className="mx-2 text-sm text-gray-500">
                {item.type === 'Virtue' && item.size !== 'Free' ? 
                  (item.size === 'Major' ? '3 pts' : '1 pt') : 
                  ''}
              </span>
              {onRemove && (
                <button 
                  onClick={() => onRemove(item.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                  title="Remove"
                  data-testid={`remove-button-${item.id}`}
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

VirtueFlawList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      // Direct format
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        size: PropTypes.oneOf(['Minor', 'Major', 'Free']).isRequired,
        type: PropTypes.oneOf(['Virtue', 'Flaw']).isRequired,
        category: PropTypes.string,
        isHouse: PropTypes.bool
      }),
      // Database format
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        referenceVirtueFlaw: PropTypes.shape({
          id: PropTypes.number.isRequired,
          name: PropTypes.string.isRequired,
          size: PropTypes.oneOf(['Minor', 'Major', 'Free']).isRequired,
          type: PropTypes.oneOf(['Virtue', 'Flaw']).isRequired,
          category: PropTypes.string
        }).isRequired,
        is_house_virtue_flaw: PropTypes.bool
      })
    ])
  ),
  onRemove: PropTypes.func,
  onSelect: PropTypes.func,
  emptyMessage: PropTypes.string,
};

export default VirtueFlawList;