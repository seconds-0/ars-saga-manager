const CharacterSheetTestErrors = require('../components/CharacterSheetComponents/CharacterSheetTestErrors').CharacterSheetTestErrors;

module.exports = function MockedLoadingSpinner() {
  return <div data-testid="loading-spinner">{CharacterSheetTestErrors.loadingSpinner}</div>;
};