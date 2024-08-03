const logger = require('./logger');

class RuleEngine {
  constructor() {
    this.rules = {
      characterTypeRestriction: (character, virtueFlaw) => {
        if (character.characterType === 'Grog' && virtueFlaw.size === 'Major') {
          return false;
        }
        return true;
      },
      maxVirtueFlawCount: (character, virtueFlaw) => {
        const currentCount = character.CharacterVirtueFlaws.length;
        const maxCount = character.characterType === 'Grog' ? 3 : 10;
        return currentCount < maxCount;
      },
      incompatibilities: (character, virtueFlaw) => {
        const incompatibilities = virtueFlaw.incompatibilities || [];
        return !character.CharacterVirtueFlaws.some(cvf => 
          incompatibilities.includes(cvf.referenceVirtueFlaw.name)
        );
      },
      prerequisites: (character, virtueFlaw) => {
        const prerequisites = virtueFlaw.prerequisites || [];
        return prerequisites.every(prereq => 
          character.CharacterVirtueFlaws.some(cvf => cvf.referenceVirtueFlaw.name === prereq)
        );
      },
      hermeticRestriction: (character, virtueFlaw) => {
        if (virtueFlaw.category === 'Hermetic') {
          return character.CharacterVirtueFlaws.some(cvf => cvf.referenceVirtueFlaw.name === 'The Gift');
        }
        return true;
      },
      multipleSelections: (character, virtueFlaw) => {
        const existingCount = character.CharacterVirtueFlaws.filter(cvf => 
          cvf.referenceVirtueFlaw.id === virtueFlaw.id
        ).length;
        return virtueFlaw.max_selections ? existingCount < virtueFlaw.max_selections : existingCount === 0;
      },
      pointLimit: (character, virtueFlaw) => {
        const remainingPoints = this.calculateRemainingPoints(character);
        const cost = virtueFlaw.size === 'Major' ? 3 : 1;
        return virtueFlaw.type !== 'Virtue' || cost <= remainingPoints;
      }
    };
  }

  isVirtueFlawEligible(character, virtueFlaw) {
    return Object.values(this.rules).every(rule => rule(character, virtueFlaw));
  }

  calculateRemainingPoints(character) {
    const maxPoints = character.maxVirtueFlawPoints;
    const usedPoints = character.CharacterVirtueFlaws.reduce((total, cvf) => {
      const cost = cvf.referenceVirtueFlaw.size === 'Major' ? 3 : 1;
      // Check if it's a special case where a Virtue doesn't cost points or a Flaw doesn't give points
      if (cvf.referenceVirtueFlaw.specialPointRule) {
        return total;
      }
      return cvf.referenceVirtueFlaw.type === 'Virtue' ? total + cost : total - cost;
    }, 0);
    return maxPoints - usedPoints;
  }
}

module.exports = new RuleEngine();