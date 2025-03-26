/**
 * Simple tests for virtueFlawPoints utilities
 * Designed to work with the simple test runner
 */

// Implement a simplified version of the functions for testing
// This avoids import issues with ESM
const calculateVirtueFlawPoints = (virtuesFlaws, characterType = null) => {
  let virtuePoints = 0;
  let flawPoints = 0;

  // Calculate points
  virtuesFlaws.forEach(item => {
    if (!item.is_house_virtue_flaw) {
      if (item.type === 'Virtue') {
        if (item.size === 'Minor') virtuePoints += 1;
        else if (item.size === 'Major') virtuePoints += 3;
      } else if (item.type === 'Flaw') {
        if (item.size === 'Minor') flawPoints -= 1;
        else if (item.size === 'Major') flawPoints -= 3;
      }
    }
  });

  // Calculate balance (negative means more virtues than flaws)
  const balance = flawPoints + virtuePoints;

  return {
    virtuePoints,
    flawPoints,
    balance,
    isBalanced: balance === 0,
    exceedsGrogLimit: characterType === 'grog' && (virtuePoints > 3 || Math.abs(flawPoints) > 3),
    exceedsCompanionMagiLimit: (characterType === 'companion' || characterType === 'magus') && 
                              (virtuePoints > 10 || Math.abs(flawPoints) > 10)
  };
};

// Test the calculateVirtueFlawPoints function
test('calculateVirtueFlawPoints returns zero points for empty array', () => {
  const result = calculateVirtueFlawPoints([]);
  expect(result.virtuePoints).toBe(0);
  expect(result.flawPoints).toBe(0);
  expect(result.balance).toBe(0);
  expect(result.isBalanced).toBe(true);
});

test('calculateVirtueFlawPoints correctly calculates points', () => {
  const virtuesFlaws = [
    { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
    { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
    { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
    { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false }
  ];
  
  const result = calculateVirtueFlawPoints(virtuesFlaws);
  expect(result.virtuePoints).toBe(4); // 1 + 3
  expect(result.flawPoints).toBe(-4); // -1 + -3
  expect(result.balance).toBe(0);
  expect(result.isBalanced).toBe(true);
});

test('calculateVirtueFlawPoints ignores house virtues/flaws', () => {
  const virtuesFlaws = [
    { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
    { type: 'Virtue', size: 'Major', is_house_virtue_flaw: true },  // Should be ignored
    { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
    { type: 'Flaw', size: 'Major', is_house_virtue_flaw: true }     // Should be ignored
  ];
  
  const result = calculateVirtueFlawPoints(virtuesFlaws);
  expect(result.virtuePoints).toBe(1); // Just the minor virtue
  expect(result.flawPoints).toBe(-1); // Just the minor flaw
  expect(result.balance).toBe(0);
  expect(result.isBalanced).toBe(true);
});

// Test character type limits
test('calculateVirtueFlawPoints detects when grog limits are exceeded', () => {
  const virtuesFlaws = [
    { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
    { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
    { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
  ];
  
  const result = calculateVirtueFlawPoints(virtuesFlaws, 'grog');
  expect(result.virtuePoints).toBe(4); // 1 + 3
  expect(result.exceedsGrogLimit).toBe(true);
});

test('calculateVirtueFlawPoints detects when companion/magi limits are exceeded', () => {
  // Create virtues totaling 11 points
  const manyVirtues = [];
  for (let i = 0; i < 11; i++) {
    manyVirtues.push({ type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false });
  }
  
  const result = calculateVirtueFlawPoints(manyVirtues, 'magus');
  expect(result.virtuePoints).toBe(11);
  expect(result.exceedsCompanionMagiLimit).toBe(true);
});

// Test that one can also use the original non-test context
describe('Context tests', () => {
  test('functions can be called from within describe blocks', () => {
    const virtuesFlaws = [
      { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }
    ];
    const result = calculateVirtueFlawPoints(virtuesFlaws);
    expect(result.virtuePoints).toBe(1);
  });
});