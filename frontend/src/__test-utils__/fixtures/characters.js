/**
 * Creates a test character with common properties
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test character object
 */
export function createTestCharacter(overrides = {}) {
  return {
    id: 'test-character-id',
    name: 'Test Character',
    player_id: 'test-user-id',
    character_type: 'magus',
    house_id: 1,
    has_the_gift: true,
    virtues: [],
    flaws: [],
    abilities: [],
    characteristics: {
      intelligence: 0,
      perception: 0,
      strength: 0,
      stamina: 0,
      presence: 0,
      communication: 0,
      dexterity: 0,
      quickness: 0,
    },
    ...overrides,
  };
}

/**
 * Creates a collection of test characters
 * @param {number} count - Number of characters to create
 * @param {Function} factory - Factory function for creating characters
 * @returns {Array} Array of test characters
 */
export function createTestCharacters(count = 3, factory = createTestCharacter) {
  return Array.from({ length: count }, (_, index) => 
    factory({
      id: `test-character-id-${index + 1}`,
      name: `Test Character ${index + 1}`,
    })
  );
}

/**
 * Predefined character data for different character types
 */
export const CHARACTER_FIXTURES = {
  MAGUS: createTestCharacter({
    character_type: 'magus',
    house_id: 1,
    has_the_gift: true,
  }),
  
  COMPANION: createTestCharacter({
    character_type: 'companion',
    house_id: null,
    has_the_gift: false,
  }),
  
  GROG: createTestCharacter({
    character_type: 'grog',
    house_id: null,
    has_the_gift: false,
  }),
  
  EMPTY: createTestCharacter({
    id: null,
    name: '',
    player_id: 'test-user-id',
    character_type: '',
    house_id: null,
    has_the_gift: false,
  }),
};

/**
 * Character list for testing components that display multiple characters
 */
export const TEST_CHARACTER_LIST = createTestCharacters(3);