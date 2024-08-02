export function calculateRemainingPoints(virtuesFlaws, maxPoints) {
    const points = virtuesFlaws.reduce((total, vf) => {
      const cost = vf.size === 'Major' ? 3 : 1;
      return vf.type === 'Virtue' ? total - cost : total + cost;
    }, maxPoints);
    return Math.max(0, points);
  }
  
  export function getMaxVirtueFlawPoints(characterType) {
    switch (characterType) {
      case 'Magus':
      case 'Companion':
        return 10;
      case 'Grog':
        return 3;
      default:
        return 0;
    }
  }