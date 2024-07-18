import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CharacterTile from './CharacterTile';
import Modal from './Modal';
import Toast from './Toast';

function CharacterListPage() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await api.get('/characters');
      setCharacters(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching characters:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (!err.response) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(`Failed to fetch characters: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleDelete = (character) => {
    setCharacterToDelete(character);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/characters/${characterToDelete.id}`);
      setCharacters(characters.filter(char => char.id !== characterToDelete.id));
      setDeleteModalOpen(false);
      setCharacterToDelete(null);
      setToastMessage('Character deleted successfully');
    } catch (err) {
      setToastMessage('Failed to delete character');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Characters</h1>
      <button 
        onClick={() => navigate('/create-character')}
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mb-4 inline-block transition-colors duration-150 ease-in-out"
      >
        Create New Character
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(character => (
          <CharacterTile
            key={character.id}
            character={character}
            onDelete={() => handleDelete(character)}
            onEdit={() => navigate(`/edit-character/${character.id}`)}
          />
        ))}
      </div>
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
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

export default CharacterListPage;