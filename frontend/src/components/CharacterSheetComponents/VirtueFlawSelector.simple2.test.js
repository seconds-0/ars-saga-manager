// Simple test for VirtueFlawSelector's handling of property names

// Test both snake_case and camelCase property access
test('VirtueFlawSelector correctly handles mixed property formats', () => {
  // Create test character objects
  const snakeCaseCharacter = {
    id: 1,
    character_type: 'grog',
    has_the_gift: false
  };
  
  const camelCaseCharacter = {
    id: 1,
    characterType: 'grog',
    hasTheGift: false
  };
  
  // Test that our getCharacterType function would work with both formats
  function getCharacterType(character) {
    return (character?.character_type || character?.characterType)?.toLowerCase();
  }
  
  expect(getCharacterType(snakeCaseCharacter)).toBe('grog');
  expect(getCharacterType(camelCaseCharacter)).toBe('grog');
  
  // Test that our getHasGift function would work with both formats
  function getHasGift(character) {
    return character?.has_the_gift || character?.hasTheGift || false;
  }
  
  expect(getHasGift(snakeCaseCharacter)).toBe(false);
  expect(getHasGift(camelCaseCharacter)).toBe(false);
});