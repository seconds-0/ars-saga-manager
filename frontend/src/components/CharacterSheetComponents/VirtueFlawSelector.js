import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

function VirtueFlawSelector({ eligibleVirtuesFlaws, onAdd, remainingPoints }) {
  const [selectedVirtueFlaw, setSelectedVirtueFlaw] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(eligibleVirtuesFlaws.map(vf => vf.category));
    return ['All', ...Array.from(cats)];
  }, [eligibleVirtuesFlaws]);

  const filteredVirtuesFlaws = useMemo(() => {
    return eligibleVirtuesFlaws.filter(vf => 
      (selectedCategory === 'All' || vf.category === selectedCategory) &&
      vf.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [eligibleVirtuesFlaws, searchTerm, selectedCategory]);

  const handleSelect = (event) => {
    const selected = eligibleVirtuesFlaws.find(vf => vf.id === parseInt(event.target.value));
    setSelectedVirtueFlaw(selected);
  };

  const handleAdd = () => {
    if (selectedVirtueFlaw) {
      const cost = selectedVirtueFlaw.size === 'Major' ? 3 : 1;
      if (cost > remainingPoints) {
        alert('Not enough virtue/flaw points remaining!');
        return;
      }
      if (window.confirm(`Are you sure you want to add ${selectedVirtueFlaw.name}? This will cost ${cost} point(s).`)) {
        onAdd(selectedVirtueFlaw);
        setSelectedVirtueFlaw(null);
      }
    }
  };

  if (eligibleVirtuesFlaws.length === 0) {
    return <div>No eligible virtues or flaws available.</div>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Add Virtue or Flaw</h3>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search virtues/flaws..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full p-2 border rounded"
        />
      </div>
      <div className="mb-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full p-2 border rounded"
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      <select 
        onChange={handleSelect}
        className="block w-full p-2 mb-2 border rounded"
      >
        <option value="">Select a Virtue or Flaw</option>
        {filteredVirtuesFlaws.map(vf => (
          <option key={vf.id} value={vf.id}>{vf.name} ({vf.size}) - {vf.cost} point(s)</option>
        ))}
      </select>
      {selectedVirtueFlaw && (
        <div className="mb-2">
          <p><strong>Description:</strong> {selectedVirtueFlaw.description}</p>
          <p><strong>Cost:</strong> {selectedVirtueFlaw.size === 'Major' ? 3 : 1} point(s)</p>
        </div>
      )}
      <button 
        onClick={handleAdd}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={!selectedVirtueFlaw}
      >
        Add Selected Virtue/Flaw
      </button>
      <p className="mt-2">Remaining points: {remainingPoints}</p>
    </div>
  );
}

VirtueFlawSelector.propTypes = {
  eligibleVirtuesFlaws: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      cost: PropTypes.number.isRequired,
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  remainingPoints: PropTypes.number.isRequired,
};

export default VirtueFlawSelector;