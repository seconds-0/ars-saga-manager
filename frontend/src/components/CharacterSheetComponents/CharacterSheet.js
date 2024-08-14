import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../api/axios';
import CharacterSheetTabs from './CharacterSheetTabs';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '../../useAuth';
import LoadingSpinner from '../LoadingSpinner';

function CharacterSheet() {
  console.log('CharacterSheet component rendering');
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  console.log('CharacterSheet rendered, ID:', id);
  console.log('User:', user);
  console.log('Is Authenticated:', isAuthenticated);
  console.log('CharacterSheetTabs component:', CharacterSheetTabs);

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

  console.log('Query state:', { isLoading, error, character });

  if (!isAuthenticated) return <div>Please log in to view this character.</div>;
  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;
  if (!character) return <div>Character not found</div>;

  return (
    <ErrorBoundary>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">
          {character.characterName || 'Unnamed'} - {character.characterType || 'Unknown Type'}
        </h2>
        <CharacterSheetTabs character={character} />
      </div>
    </ErrorBoundary>
  );
}

export default CharacterSheet;