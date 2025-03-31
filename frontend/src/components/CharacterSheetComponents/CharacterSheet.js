import React, { useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../api/axios';
import CharacterSheetTabs from './CharacterSheetTabs';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '../../useAuth';
import LoadingSpinner from '../LoadingSpinner';

function CharacterSheet() {
  console.log('CharacterSheet rendering');
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Use ref to maintain stable function identity across renders
  const saveRef = useRef();

  const { data: character, isLoading, error } = useQuery(['character', id], () =>
    api.get(`/characters/${id}`).then((res) => {
      console.log('API response:', res.data);
      if (!res.data || Object.keys(res.data).length === 0) {
        console.log('No character data');
        return null;
      }
      return res.data;
    }),
    {
      enabled: isAuthenticated,
      retry: false,
      onError: (err) => {
        console.error('Error fetching character:', err);
      },
    }
  );

  const mutation = useMutation(
    (updatedCharacterData) => api.put(`/characters/${id}`, updatedCharacterData),
    {
      onSuccess: (data, variables) => {
        // Check if this was an age update that should recalculate XP
        const isAgeUpdate = variables && variables.age !== undefined && variables.recalculateXp === true;
        
        console.log('Character update successful. Data:', data, 'Variables:', variables, 'isAgeUpdate:', isAgeUpdate);
        
        if (isAgeUpdate) {
          console.log('Age update detected in mutation success handler, forcing data refresh');
          // For age updates, we want to make sure we get fresh data
          // First invalidate the query cache
          queryClient.invalidateQueries(['character', id]);
          
          // Then force an immediate refetch to get the updated experience values
          queryClient.refetchQueries(['character', id], { 
            active: true,
            inactive: true
          });
        } else {
          // For regular updates, just invalidate the cache
          queryClient.invalidateQueries(['character', id]);
        }
      },
      onError: (err, variables) => {
        console.error('Error updating character:', err, 'Variables:', variables);
      },
    }
  );

  // Create stable function with useCallback, but also store it in a ref
  // The function identity won't change between renders
  const handleSave = useCallback((updatedData) => {
    console.log('handleSave called in CharacterSheet with:', updatedData);
    mutation.mutate(updatedData);
  }, [mutation, id]);
  
  // Store the stable function in ref to ensure it maintains identity
  saveRef.current = handleSave;

  // This is the function we'll pass to children - it never changes identity
  const stableSave = useCallback((data) => {
    console.log('stableSave called with data:', data);
    
    if (saveRef.current) {
      // Pass along the data to the actual save function
      // The refresh logic is now handled in the mutation's onSuccess handler
      saveRef.current(data);
    }
  }, []);

  return (
    <ErrorBoundary>
      {!isAuthenticated ? (
        <div data-testid="login-message">Please log in to view this character.</div>
      ) : isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : !character ? (
        <div>Character not found</div>
      ) : (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">
            {character.name || 'Unnamed'} - {character.character_type || 'Unknown Type'}
          </h2>
          <CharacterSheetTabs character={character} onSave={stableSave} />
        </div>
      )}
    </ErrorBoundary>
  );
}

export default CharacterSheet;