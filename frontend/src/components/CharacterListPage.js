import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../api/axios';
import CharacterTile from './CharacterTile';
import Modal from './Modal';
import Toast from './Toast';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

// Character filter component
const CharacterFilter = React.memo(({ onSearch, onFilterChange, sortOrder, onSortChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [characterType, setCharacterType] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setCharacterType(type);
    onFilterChange(type);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search by name..."
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Search
        </button>
      </form>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <FaFilter className="text-gray-400" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <select
          value={characterType}
          onChange={handleTypeChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
        >
          <option value="">All Types</option>
          <option value="magus">Magus</option>
          <option value="companion">Companion</option>
          <option value="grog">Grog</option>
        </select>

        <div className="flex items-center ml-auto space-x-2">
          <div className="flex items-center space-x-2 text-gray-600">
            <span className="text-sm font-medium">Sort:</span>
            <button
              onClick={onSortChange}
              className="text-gray-700 hover:text-blue-600 transition-colors"
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CharacterFilter.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired
};

// Empty state component
const EmptyState = React.memo(({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm text-center">
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No characters found</h3>
    <p className="text-gray-600 mb-4">Create your first character to get started</p>
    <button
      onClick={onCreateClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
    >
      Create New Character
    </button>
  </div>
));

EmptyState.propTypes = {
  onCreateClick: PropTypes.func.isRequired
};

// Loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="h-16 bg-gray-200 rounded-lg mb-6"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-200 h-40 rounded-lg"></div>
      ))}
    </div>
  </div>
));

function CharacterListPage() {
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  
  const navigate = useNavigate();

  // Fetch characters function - memoized to prevent unnecessary recreations
  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/characters');
      const fetchedCharacters = response.data.characters || [];
      setCharacters(fetchedCharacters);
      setFilteredCharacters(fetchedCharacters);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching characters:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (!err.response) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(`Failed to fetch characters: ${err.response?.data?.message || err.message}`);
      }
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Handle character deletion
  const handleDelete = useCallback((character) => {
    setCharacterToDelete(character);
    setDeleteModalOpen(true);
  }, []);

  // Confirm deletion
  const confirmDelete = useCallback(async () => {
    try {
      await api.delete(`/characters/${characterToDelete.id}`);
      
      // Update both characters arrays
      const updatedCharacters = characters.filter(char => char.id !== characterToDelete.id);
      setCharacters(updatedCharacters);
      setFilteredCharacters(prev => prev.filter(char => char.id !== characterToDelete.id));
      
      // Reset modal state and show success message
      setDeleteModalOpen(false);
      setCharacterToDelete(null);
      setToastMessage('Character deleted successfully');
      setToastType('success');
    } catch (err) {
      setToastMessage('Failed to delete character: ' + (err.response?.data?.message || err.message));
      setToastType('error');
    }
  }, [characterToDelete, characters]);

  // Navigate to character creation
  const handleCreateClick = useCallback(() => {
    navigate('/create-character');
  }, [navigate]);

  // Search handler
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  // Filter handler
  const handleFilterChange = useCallback((type) => {
    setFilterType(type);
  }, []);

  // Sort handler
  const handleSortChange = useCallback(() => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  }, []);

  // Apply filters and sorting - this is memoized to avoid recalculations
  useEffect(() => {
    let result = [...characters];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(char => 
        char.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (filterType) {
      result = result.filter(char => 
        char.character_type === filterType
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });
    
    setFilteredCharacters(result);
  }, [characters, searchTerm, filterType, sortOrder]);

  // Character count by type - memoized to avoid recalculations
  const characterCounts = useMemo(() => {
    return characters.reduce((counts, char) => {
      const type = char.character_type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {});
  }, [characters]);

  // Render loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchCharacters}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Characters</h1>
          <p className="text-gray-600 mt-1">
            Manage your Ars Magica characters
          </p>
        </div>
        <button 
          onClick={handleCreateClick}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center self-start"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Character
        </button>
      </div>

      {/* Character type stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500">Total Characters</h3>
          <p className="text-2xl font-bold">{characters.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500">Magi</h3>
          <p className="text-2xl font-bold">{characterCounts.magus || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500">Companions</h3>
          <p className="text-2xl font-bold">{characterCounts.companion || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-500">Grogs</h3>
          <p className="text-2xl font-bold">{characterCounts.grog || 0}</p>
        </div>
      </div>

      {/* Search and Filter controls */}
      <CharacterFilter 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {/* Character grid or empty state */}
      {filteredCharacters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharacters.map(character => (
            <CharacterTile
              key={character.id}
              character={character}
              onDelete={() => handleDelete(character)}
              onEdit={() => navigate(`/character/${character.id}`)}
            />
          ))}
        </div>
      ) : (
        // Show different empty states based on whether we're filtering or not
        characters.length > 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-600">
              No characters match your search or filter criteria. Try adjusting your filters or create a new character.
            </p>
          </div>
        ) : (
          <EmptyState onCreateClick={handleCreateClick} />
        )
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCharacterToDelete(null);
        }}
        title="Confirm Delete"
        onConfirm={confirmDelete}
        confirmText="Delete"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete {characterToDelete?.name}? This action cannot be undone.
        </p>
      </Modal>

      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

export default React.memo(CharacterListPage);