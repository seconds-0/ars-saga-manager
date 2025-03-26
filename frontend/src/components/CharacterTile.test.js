import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterTile from './CharacterTile';

describe('CharacterTile', () => {
  const defaultCharacter = {
    id: 'test-id-1',
    name: 'Test Character',
    character_type: 'magus',
    intelligence: 2,
    strength: -1,
    stamina: 0,
    communication: 3
  };

  const onDeleteMock = jest.fn();
  const onEditMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders character information correctly', () => {
    render(
      <CharacterTile 
        character={defaultCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );

    // Check name and type badge
    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText('Magus')).toBeInTheDocument();

    // Check characteristic values with appropriate formatting
    expect(screen.getByText('Int:')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument(); // Intelligence formatted
    expect(screen.getByText('Str:')).toBeInTheDocument();
    expect(screen.getByText('-1')).toBeInTheDocument(); // Strength formatted
    expect(screen.getByText('Sta:')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Stamina formatted
    expect(screen.getByText('Com:')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument(); // Communication formatted

    // Check button
    expect(screen.getByText('View Character')).toBeInTheDocument();
  });

  it('shows different badges for different character types', () => {
    // Test Companion
    const companionCharacter = { ...defaultCharacter, character_type: 'companion' };
    const { rerender } = render(
      <CharacterTile 
        character={companionCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );
    expect(screen.getByText('Companion')).toBeInTheDocument();

    // Test Grog
    const grogCharacter = { ...defaultCharacter, character_type: 'grog' };
    rerender(
      <CharacterTile 
        character={grogCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );
    expect(screen.getByText('Grog')).toBeInTheDocument();

    // Test Unknown type
    const unknownTypeCharacter = { ...defaultCharacter, character_type: null };
    rerender(
      <CharacterTile 
        character={unknownTypeCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('calls the onDelete callback when delete button is clicked', () => {
    render(
      <CharacterTile 
        character={defaultCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );

    const deleteButton = screen.getByLabelText('Delete character');
    fireEvent.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onEdit callback when view character button is clicked', () => {
    render(
      <CharacterTile 
        character={defaultCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );

    const viewButton = screen.getByText('View Character');
    fireEvent.click(viewButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('handles missing characteristic values', () => {
    const incompleteCharacter = {
      id: 'test-id-2',
      name: 'Incomplete Character',
      character_type: 'magus',
      // No characteristics
    };

    render(
      <CharacterTile 
        character={incompleteCharacter} 
        onDelete={onDeleteMock} 
        onEdit={onEditMock} 
      />
    );

    // Characteristics section should not display incomplete data
    expect(screen.queryByText('Int:')).not.toBeInTheDocument();
    expect(screen.queryByText('Str:')).not.toBeInTheDocument();
  });
});
