import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CharacterTile from './CharacterTile';
import Modal from './Modal';
import Toast from './Toast';
import parchmentBg from '../parchment-bg.jpg';

function HomePage() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await api.get('/characters');
      setCharacters(response.data);
    } catch (error) {
      console.error('Error fetching characters:', error);
      setToastMessage('Error fetching characters');
    }
  };

  const handleCreateCharacter = () => {
    navigate('/create-character');
  };

  const handleDeleteCharacter = (character) => {
    setCharacterToDelete(character);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/characters/${characterToDelete.id}`);
      setCharacters(characters.filter(c => c.id !== characterToDelete.id));
      setDeleteModalOpen(false);
      setCharacterToDelete(null);
      setToastMessage('Character deleted successfully');
    } catch (error) {
      console.error('Error deleting character:', error);
      setToastMessage('Error deleting character');
    }
  };

  return (
    <div className="min-h-screen bg-cream" style={{backgroundImage: `url(${parchmentBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.map(character => (
            <CharacterTile
              key={character.id}
              character={character}
              onDelete={() => handleDeleteCharacter(character)}
              onEdit={() => navigate(`/edit-character/${character.id}`)}
            />
          ))}
        </div>
        <button
          onClick={handleCreateCharacter}
          className="mt-8 bg-deep-red text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-red"
        >
          Create New Character
        </button>
      </main>

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

export default HomePage;