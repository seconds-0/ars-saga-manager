const VALID_CHARACTER_TYPES = ['grog', 'companion', 'magus'];

function isValidCharacterType(characterType) {
  if (!characterType) return false;
  return VALID_CHARACTER_TYPES.includes(characterType.toLowerCase());
}

module.exports = {
  isValidCharacterType,
  VALID_CHARACTER_TYPES
};