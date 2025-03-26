const ruleEngine = require('./ruleEngine');

function validateVirtueFlaw(virtueFlaw, characterType) {
  if (!ruleEngine.isValidCharacterType(characterType)) {
    throw new Error('Only Grog, Companion, and Magus are currently supported');
  }
  // ... rest of validation code ...
} 