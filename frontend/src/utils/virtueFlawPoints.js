/**
 * Calculates points for virtues and flaws, handling special cases and character type restrictions
 * @param {Array} virtuesFlaws - Array of virtue/flaw objects
 * @param {string} characterType - 'grog', 'companion', or 'magus'
 * @returns {Object} Point calculation results
 */
export const calculateVirtueFlawPoints = (virtuesFlaws, characterType = null) => {
  let virtuePoints = 0;
  let flawPoints = 0;

  // Filter out house virtues/flaws and calculate points
  virtuesFlaws.forEach(item => {
    if (!item.is_house_virtue_flaw) {
      if (item.type === 'Virtue') {
        virtuePoints += getPointValue(item.size);
      } else if (item.type === 'Flaw') {
        flawPoints += getPointValue(item.size);
      }
    }
  });

  // Calculate balance (negative means more virtues than flaws)
  const balance = flawPoints - virtuePoints;

  // Check character type specific limits
  const exceedsGrogLimit = characterType === 'grog' && (virtuePoints > 3 || flawPoints > 3);
  const exceedsCompanionMagiLimit = (characterType === 'companion' || characterType === 'magus') && 
                                   (virtuePoints > 10 || flawPoints > 10);

  return {
    virtuePoints,
    flawPoints,
    balance,
    isBalanced: balance === 0,
    exceedsGrogLimit,
    exceedsCompanionMagiLimit
  };
};

/**
 * Gets point value based on virtue/flaw size
 * @param {string} size - 'Minor', 'Major', or 'Free'
 * @returns {number} Point value
 */
const getPointValue = (size) => {
  switch (size) {
    case 'Minor':
      return 1;
    case 'Major':
      return 3;
    case 'Free':
      return 0;
    default:
      throw new Error(`Invalid virtue/flaw size: ${size}`);
  }
}; 