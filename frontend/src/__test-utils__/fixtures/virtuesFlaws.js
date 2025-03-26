/**
 * Creates a test virtue or flaw
 * @param {Object} overrides - Properties to override
 * @returns {Object} Test virtue/flaw object
 */
export function createTestVirtueFlaw(overrides = {}) {
  return {
    id: 'test-virtue-id',
    name: 'Test Virtue',
    description: 'This is a test virtue description',
    type: 'virtue',
    category: 'general',
    points: 1,
    max_allowed: null,
    character_types: ['magus', 'companion', 'grog'],
    has_specification: false,
    specification_label: null,
    has_multiple_specifications: false,
    requires_major_focus: false,
    requires_minor_focus: false,
    requires_magical_focus: false,
    is_supernatural_virtue: false,
    is_free_social_status: false,
    requires_the_gift: false,
    incompatible_virtues: [],
    incompatible_flaws: [],
    ...overrides,
  };
}

/**
 * Creates a collection of test virtues or flaws
 * @param {number} count - Number to create
 * @param {Object} baseOverrides - Base properties for all items
 * @returns {Array} Array of test virtues/flaws
 */
export function createTestVirtuesFlaws(count = 3, baseOverrides = {}) {
  return Array.from({ length: count }, (_, index) => 
    createTestVirtueFlaw({
      id: `test-virtue-id-${index + 1}`,
      name: `Test Virtue ${index + 1}`,
      ...baseOverrides,
    })
  );
}

/**
 * Predefined virtue fixtures
 */
export const VIRTUE_FIXTURES = {
  GENERAL: createTestVirtueFlaw({
    id: 'general-virtue-id',
    name: 'General Virtue',
    type: 'virtue',
    category: 'general',
    points: 1,
  }),
  
  HERMETIC: createTestVirtueFlaw({
    id: 'hermetic-virtue-id',
    name: 'Hermetic Virtue',
    type: 'virtue',
    category: 'hermetic',
    points: 1,
    character_types: ['magus'],
    requires_the_gift: true,
  }),
  
  SUPERNATURAL: createTestVirtueFlaw({
    id: 'supernatural-virtue-id',
    name: 'Supernatural Virtue',
    type: 'virtue',
    category: 'supernatural',
    points: 3,
    is_supernatural_virtue: true,
  }),
  
  SOCIAL_STATUS: createTestVirtueFlaw({
    id: 'social-status-virtue-id',
    name: 'Social Status Virtue',
    type: 'virtue',
    category: 'social status',
    points: 1,
    is_free_social_status: true,
  }),
  
  WITH_SPECIFICATION: createTestVirtueFlaw({
    id: 'virtue-with-spec-id',
    name: 'Virtue With Specification',
    type: 'virtue',
    category: 'general',
    points: 1,
    has_specification: true,
    specification_label: 'Specify:',
  }),
};

/**
 * Predefined flaw fixtures
 */
export const FLAW_FIXTURES = {
  GENERAL: createTestVirtueFlaw({
    id: 'general-flaw-id',
    name: 'General Flaw',
    type: 'flaw',
    category: 'general',
    points: -1,
  }),
  
  HERMETIC: createTestVirtueFlaw({
    id: 'hermetic-flaw-id',
    name: 'Hermetic Flaw',
    type: 'flaw',
    category: 'hermetic',
    points: -3,
    character_types: ['magus'],
    requires_the_gift: true,
  }),
  
  PERSONALITY: createTestVirtueFlaw({
    id: 'personality-flaw-id',
    name: 'Personality Flaw',
    type: 'flaw',
    category: 'personality',
    points: -1,
  }),
  
  STORY: createTestVirtueFlaw({
    id: 'story-flaw-id',
    name: 'Story Flaw',
    type: 'flaw',
    category: 'story',
    points: -1,
  }),
  
  WITH_SPECIFICATION: createTestVirtueFlaw({
    id: 'flaw-with-spec-id',
    name: 'Flaw With Specification',
    type: 'flaw',
    category: 'general',
    points: -1,
    has_specification: true,
    specification_label: 'Specify:',
  }),
};

/**
 * Combined reference virtues and flaws for testing
 */
export const TEST_VIRTUES_FLAWS = [
  ...Object.values(VIRTUE_FIXTURES),
  ...Object.values(FLAW_FIXTURES),
];

/**
 * Predefined character virtues and flaws for a character
 */
export const CHARACTER_VIRTUES_FLAWS = {
  VIRTUES: [
    {
      id: 'char-virtue-1',
      reference_virtue_flaw_id: VIRTUE_FIXTURES.GENERAL.id,
      name: VIRTUE_FIXTURES.GENERAL.name,
      description: VIRTUE_FIXTURES.GENERAL.description,
      type: 'virtue',
      category: 'general',
      points: 1,
      specification: null,
    },
    {
      id: 'char-virtue-2',
      reference_virtue_flaw_id: VIRTUE_FIXTURES.WITH_SPECIFICATION.id,
      name: VIRTUE_FIXTURES.WITH_SPECIFICATION.name,
      description: VIRTUE_FIXTURES.WITH_SPECIFICATION.description,
      type: 'virtue',
      category: 'general',
      points: 1,
      specification: 'Test Specification',
    },
  ],
  
  FLAWS: [
    {
      id: 'char-flaw-1',
      reference_virtue_flaw_id: FLAW_FIXTURES.GENERAL.id,
      name: FLAW_FIXTURES.GENERAL.name,
      description: FLAW_FIXTURES.GENERAL.description,
      type: 'flaw',
      category: 'general',
      points: -1,
      specification: null,
    },
  ],
};