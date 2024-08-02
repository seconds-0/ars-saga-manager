import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../api/axios';
import { debounce } from 'lodash';

function VirtueFlawSelector({ onAdd, remainingPoints }) {
  const [search, setSearch] = useState('');
  const [filteredVirtuesFlaws, setFilteredVirtuesFlaws] = useState([]);

  const fetchReferenceVirtuesFlaws = async () => {
    console.log('Fetching reference virtues and flaws...'); // Debug log
    const response = await api.get('/reference-virtues-flaws');
    console.log('API response:', response.data); // Debug log
    return response.data;
  };

  const { data: allVirtuesFlaws, isLoading, error } = useQuery(
    'referenceVirtuesFlaws',
    fetchReferenceVirtuesFlaws,
    {
      staleTime: Infinity,
      onSuccess: (data) => console.log('Query successful, data:', data), // Debug log
      onError: (err) => console.error('Query error:', err), // Debug log
    }
  );

  useEffect(() => {
    console.log('Effect triggered, allVirtuesFlaws:', allVirtuesFlaws); // Debug log
    if (allVirtuesFlaws) {
      const filtered = allVirtuesFlaws
        .filter(vf => vf.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredVirtuesFlaws(filtered);
      console.log('Filtered virtues and flaws:', filtered); // Debug log
    }
  }, [search, allVirtuesFlaws]);

  const debouncedSearch = debounce((value) => {
    setSearch(value);
  }, 300);

  console.log('Render - isLoading:', isLoading, 'error:', error, 'filteredVirtuesFlaws:', filteredVirtuesFlaws); // Debug log

  if (isLoading) return <div>Loading virtues and flaws...</div>;
  if (error) return <div>Error loading virtues and flaws: {error.message}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search virtues and flaws"
        onChange={(e) => debouncedSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="border p-4 h-64 overflow-y-auto">
        {filteredVirtuesFlaws.length === 0 ? (
          <div>No virtues or flaws found.</div>
        ) : (
          <ul className="space-y-2">
            {filteredVirtuesFlaws.map((vf) => (
              <li key={vf.id} className="flex justify-between items-center">
                <span>{vf.name} ({vf.size})</span>
                <button
                  onClick={() => onAdd(vf.id)}
                  disabled={vf.type === 'Virtue' && vf.cost > remainingPoints}
                  className="bg-blue-500 text-white px-2 py-1 rounded disabled:bg-gray-300"
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VirtueFlawSelector;