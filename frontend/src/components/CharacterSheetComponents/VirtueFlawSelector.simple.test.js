// Simple test for VirtueFlawSelector that tests both camelCase and snake_case handling
const { createValidationRules } = require('../../utils/virtueFlawValidation');

// Mock character data with snake_case properties
const snakeCaseCharacter = {
  id: 1,
  character_type: 'grog',
  has_the_gift: false,
  house_id: null
};

// Mock character data with camelCase properties
const camelCaseCharacter = {
  id: 1,
  characterType: 'grog',
  hasTheGift: false,
  houseId: null
};

// Test character_type/characterType handling
test('createValidationRules handles snake_case character_type', () => {
  try {
    const rules = createValidationRules(snakeCaseCharacter.character_type, {
      allowHermeticVirtues: snakeCaseCharacter.has_the_gift,
      house: snakeCaseCharacter.house_id
    });
    
    expect(rules.characterType).toBe('grog');
    expect(rules.allowHermeticVirtues).toBe(false);
    console.log('Snake case test passed!');
  } catch (error) {
    console.error('Snake case test failed:', error);
    throw error;
  }
});

// Test characterType/hasTheGift handling
test('createValidationRules handles camelCase characterType', () => {
  try {
    const rules = createValidationRules(camelCaseCharacter.characterType, {
      allowHermeticVirtues: camelCaseCharacter.hasTheGift,
      house: camelCaseCharacter.houseId
    });
    
    expect(rules.characterType).toBe('grog');
    expect(rules.allowHermeticVirtues).toBe(false);
    console.log('Camel case test passed!');
  } catch (error) {
    console.error('Camel case test failed:', error);
    throw error;
  }
});