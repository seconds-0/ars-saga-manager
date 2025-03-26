// frontend/src/components/CharacterSheetComponents/VirtueFlawDetails.js

import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import api from '../../api/axios';

const virtueFlawMachine = createMachine({
  id: 'virtueFlawDetails',
  initial: 'viewing',
  states: {
    viewing: {
      on: { EDIT: 'editing' }
    },
    editing: {
      on: { 
        SAVE: 'saving',
        CANCEL: 'viewing'
      }
    },
    saving: {
      on: {
        SUCCESS: 'viewing',
        ERROR: 'editing'
      }
    }
  }
});

// List of characteristics for selection dropdown
const CHARACTERISTICS = [
  'Strength', 'Stamina', 'Dexterity', 'Quickness',
  'Intelligence', 'Presence', 'Communication', 'Perception'
];

function VirtueFlawDetails({ virtueFlaw, onClose, characterId }) {
  const [state, send] = useMachine(virtueFlawMachine);
  const [editedSelections, setEditedSelections] = useState(virtueFlaw.selections || {});
  const [errorMessage, setErrorMessage] = useState('');
  const [options, setOptions] = useState([]);
  const queryClient = useQueryClient();

  const updateVirtueFlaw = useMutation(
    (updatedVirtueFlaw) => api.put(`/characters/${characterId}/virtues-flaws/${virtueFlaw.id}`, updatedVirtueFlaw),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['virtuesFlaws', characterId]);
        // Also invalidate abilities since they may be affected by the selection
        queryClient.invalidateQueries(['abilities', characterId]);
        send('SUCCESS');
        setErrorMessage('');
      },
      onError: (error) => {
        send('ERROR');
        setErrorMessage(error.response?.data?.message || 'An error occurred while saving.');
      },
    }
  );

  // Fetch options if a specification query is provided
  const { data: optionsData, isLoading: optionsLoading } = useQuery(
    ['virtueFlaw', 'options', virtueFlaw.referenceVirtueFlaw?.specification_options_query],
    async () => {
      if (!virtueFlaw.referenceVirtueFlaw?.specification_options_query) {
        return null;
      }
      
      const response = await api.get(virtueFlaw.referenceVirtueFlaw.specification_options_query);
      return response.data;
    },
    {
      enabled: !!virtueFlaw.referenceVirtueFlaw?.specification_options_query && 
               !!virtueFlaw.referenceVirtueFlaw?.requires_specification,
      onError: (error) => {
        console.error('Error fetching options:', error);
      }
    }
  );

  // Generate options based on specification type
  useEffect(() => {
    if (!virtueFlaw.referenceVirtueFlaw?.requires_specification) {
      return;
    }

    const specType = virtueFlaw.referenceVirtueFlaw.specification_type;
    
    if (specType === 'Characteristic') {
      setOptions(CHARACTERISTICS);
    } else if (specType === 'Ability' && optionsData) {
      // For abilities, extract from API response
      const abilityOptions = optionsData.data || optionsData;
      setOptions(abilityOptions.map(a => a.name));
    } else if (specType === 'Art' && optionsData) {
      // For arts, extract from API response
      const artOptions = optionsData.data || optionsData;
      setOptions(artOptions.map(a => a.name));
    }
  }, [virtueFlaw.referenceVirtueFlaw, optionsData]);

  // Initialize empty selections object if virtue/flaw requires specifications
  useEffect(() => {
    if (virtueFlaw.referenceVirtueFlaw?.requires_specification && 
        (!virtueFlaw.selections || Object.keys(virtueFlaw.selections).length === 0)) {
      
      const specType = virtueFlaw.referenceVirtueFlaw.specification_type;
      // Initialize selection with the type
      setEditedSelections({ [specType]: '' });
    }
  }, [virtueFlaw]);

  const handleSave = () => {
    setErrorMessage('');
    
    // Validate selections
    if (virtueFlaw.referenceVirtueFlaw?.requires_specification) {
      const specType = virtueFlaw.referenceVirtueFlaw.specification_type;
      
      if (!editedSelections[specType] || editedSelections[specType] === '') {
        setErrorMessage(`A selection for ${specType} is required.`);
        return;
      }
    }
    
    send('SAVE');
    updateVirtueFlaw.mutate({ selections: editedSelections });
  };

  // Render different input types based on specification_type
  const renderSpecificationInput = (key) => {
    // We don't need to use specType here since we already check options.length
    if (options.length > 0) {
      return (
        <select
          value={editedSelections[key] || ''}
          onChange={(e) => setEditedSelections({...editedSelections, [key]: e.target.value})}
          className="border rounded px-2 py-1 w-full"
          disabled={state.matches('saving')}
        >
          <option value="">-- Select {key} --</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else {
      // Default to text input if options aren't available
      return (
        <input
          type="text"
          value={editedSelections[key] || ''}
          onChange={(e) => setEditedSelections({...editedSelections, [key]: e.target.value})}
          className="border rounded px-2 py-1 w-full"
          disabled={state.matches('saving')}
          placeholder={`Enter ${key}...`}
        />
      );
    }
  };

  // Determine if the virtue/flaw requires specification
  const requiresSpecification = !!virtueFlaw.referenceVirtueFlaw?.requires_specification;
  const hasSelections = virtueFlaw.selections && Object.keys(virtueFlaw.selections).length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">{virtueFlaw.referenceVirtueFlaw.name}</h2>
        <p className="mb-4">{virtueFlaw.referenceVirtueFlaw.description}</p>
        
        {/* Display current selections */}
        {hasSelections && state.matches('viewing') && (
          <div className="mb-4 bg-gray-50 p-3 rounded border">
            <h3 className="font-semibold text-sm text-gray-700 mb-1">Selections:</h3>
            {Object.entries(virtueFlaw.selections).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span> {value}
              </div>
            ))}
          </div>
        )}
        
        {/* Display specification requirements warning */}
        {requiresSpecification && !hasSelections && state.matches('viewing') && (
          <div className="mb-4 bg-yellow-50 p-3 rounded border border-yellow-200 text-yellow-800">
            <h3 className="font-semibold text-sm mb-1">Required Selection Needed</h3>
            <p className="text-sm">
              This {virtueFlaw.referenceVirtueFlaw.type} requires you to select 
              a {virtueFlaw.referenceVirtueFlaw.specification_type}.
              Click Edit to make your selection.
            </p>
          </div>
        )}
        
        {/* Editing mode */}
        {state.matches('viewing') && (
          <button 
            onClick={() => send('EDIT')}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Edit
          </button>
        )}
        
        {(state.matches('editing') || state.matches('saving')) && (
          <>
            {/* Specification inputs */}
            {requiresSpecification && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Required Selection
                </h3>
                {optionsLoading ? (
                  <p className="text-sm text-gray-500">Loading options...</p>
                ) : (
                  Object.keys(editedSelections).map((key) => (
                    <div key={key} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">{key}:</label>
                      {renderSpecificationInput(key)}
                    </div>
                  ))
                )}
              </div>
            )}
            
            {/* Custom selections (non-specification fields) */}
            {hasSelections && !requiresSpecification && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Custom Fields
                </h3>
                {Object.keys(virtueFlaw.selections || {}).map((key) => (
                  <div key={key} className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">{key}:</label>
                    <input
                      type="text"
                      value={editedSelections[key] || ''}
                      onChange={(e) => setEditedSelections({...editedSelections, [key]: e.target.value})}
                      className="border rounded px-2 py-1 w-full"
                      disabled={state.matches('saving')}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Error message */}
            {errorMessage && (
              <p className="text-red-500 mb-2 text-sm bg-red-50 p-2 rounded">{errorMessage}</p>
            )}
            
            {/* Save/Cancel buttons */}
            <div className="flex mt-4">
              <button 
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition-colors"
                disabled={state.matches('saving')}
              >
                {state.matches('saving') ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => send('CANCEL')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                disabled={state.matches('saving')}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        
        <button 
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded ml-2 hover:bg-gray-400 transition-colors"
          disabled={state.matches('saving')}
          data-testid="close-button"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default VirtueFlawDetails;