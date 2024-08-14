import React from 'react';
import PropTypes from 'prop-types';

const MockCharacterSheetTabs = ({ character }) => (
  <div data-testid="character-sheet-tabs">
    Mocked CharacterSheetTabs for {character.characterName}
  </div>
);

MockCharacterSheetTabs.propTypes = {
  character: PropTypes.shape({
    characterName: PropTypes.string.isRequired,
    // Add other required props here
  }).isRequired,
};

export default MockCharacterSheetTabs;