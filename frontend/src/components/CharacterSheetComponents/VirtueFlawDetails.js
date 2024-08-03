// frontend/src/components/CharacterSheetComponents/VirtueFlawDetails.js

import React, { useState } from 'react';
import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { useMutation, useQueryClient } from 'react-query';
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

function VirtueFlawDetails({ virtueFlaw, onClose, characterId }) {
  const [state, send] = useMachine(virtueFlawMachine);
  const [editedSelections, setEditedSelections] = useState(virtueFlaw.selections || {});
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();

  const updateVirtueFlaw = useMutation(
    (updatedVirtueFlaw) => api.put(`/characters/${characterId}/virtues-flaws/${virtueFlaw.id}`, updatedVirtueFlaw),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['virtuesFlaws', characterId]);
        send('SUCCESS');
        setErrorMessage('');
      },
      onError: (error) => {
        send('ERROR');
        setErrorMessage(error.response?.data?.message || 'An error occurred while saving.');
      },
    }
  );

  const handleSave = () => {
    setErrorMessage('');
    send('SAVE');
    updateVirtueFlaw.mutate({ selections: editedSelections });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded max-w-lg w-full">
        <h2 className="text-xl font-bold mb-2">{virtueFlaw.referenceVirtueFlaw.name}</h2>
        <p className="mb-4">{virtueFlaw.referenceVirtueFlaw.description}</p>
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
            {Object.keys(virtueFlaw.selections || {}).map((key) => (
              <div key={key} className="mb-2">
                <label className="block">{key}:</label>
                <input
                  type="text"
                  value={editedSelections[key] || ''}
                  onChange={(e) => setEditedSelections({...editedSelections, [key]: e.target.value})}
                  className="border rounded px-2 py-1 w-full"
                  disabled={state.matches('saving')}
                />
              </div>
            ))}
            {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
            <button 
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              disabled={state.matches('saving')}
            >
              {state.matches('saving') ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={() => send('CANCEL')}
              className="bg-red-500 text-white px-4 py-2 rounded"
              disabled={state.matches('saving')}
            >
              Cancel
            </button>
          </>
        )}
        <button 
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded ml-2"
          disabled={state.matches('saving')}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default VirtueFlawDetails;