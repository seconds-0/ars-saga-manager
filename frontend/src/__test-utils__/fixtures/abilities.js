/**
 * Creates a test ability
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test ability object
 */
export function createTestAbility(overrides = {}) {
  return {
    id: 'test-ability-id',
    name: 'Test Ability',
    description: 'This is a test ability description',
    type: 'general',
    character_types: ['magus', 'companion', 'grog'],
    specialty_required: false,
    specialty_types: [],
    is_puissant_available: true,
    is_affinity_available: true,
    ...overrides,
  };
}

/**
 * Creates a collection of test abilities
 * @param {number} count - Number to create
 * @param {Object} baseOverrides - Base properties for all items
 * @returns {Array} Array of test abilities
 */
export function createTestAbilities(count = 3, baseOverrides = {}) {
  return Array.from({ length: count }, (_, index) => 
    createTestAbility({
      id: `test-ability-id-${index + 1}`,
      name: `Test Ability ${index + 1}`,
      ...baseOverrides,
    })
  );
}

/**
 * Predefined ability fixtures by type
 */
export const ABILITY_FIXTURES = {
  GENERAL: createTestAbility({
    id: 'general-ability-id',
    name: 'General Ability',
    type: 'general',
  }),
  
  ACADEMIC: createTestAbility({
    id: 'academic-ability-id',
    name: 'Academic Ability',
    type: 'academic',
  }),
  
  ARCANE: createTestAbility({
    id: 'arcane-ability-id',
    name: 'Arcane Ability',
    type: 'arcane',
    character_types: ['magus'],
  }),
  
  MARTIAL: createTestAbility({
    id: 'martial-ability-id',
    name: 'Martial Ability',
    type: 'martial',
  }),
  
  SUPERNATURAL: createTestAbility({
    id: 'supernatural-ability-id',
    name: 'Supernatural Ability',
    type: 'supernatural',
  }),

  WITH_SPECIALTY: createTestAbility({
    id: 'specialty-ability-id',
    name: 'Specialty Ability',
    type: 'general',
    specialty_required: true,
    specialty_types: ['Type 1', 'Type 2', 'Type 3'],
  }),
};

/**
 * Combined reference abilities for testing
 */
export const TEST_ABILITIES = Object.values(ABILITY_FIXTURES);

/**
 * Character abilities for a character
 */
export const CHARACTER_ABILITIES = [
  {
    id: 'char-ability-1',
    reference_ability_id: ABILITY_FIXTURES.GENERAL.id,
    name: ABILITY_FIXTURES.GENERAL.name,
    description: ABILITY_FIXTURES.GENERAL.description,
    type: 'general',
    score: 2,
    specialty: null,
  },
  {
    id: 'char-ability-2',
    reference_ability_id: ABILITY_FIXTURES.WITH_SPECIALTY.id,
    name: ABILITY_FIXTURES.WITH_SPECIALTY.name,
    description: ABILITY_FIXTURES.WITH_SPECIALTY.description,
    type: 'general',
    score: 3,
    specialty: 'Test Specialty',
  },
];