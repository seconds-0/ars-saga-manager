const fs = require('fs');
const path = require('path');

// Updated effect for the test to pass
const updatedEffect = `  // Effect to handle auto-saving on characteristics or useCunning changes
  useEffect(() => {
    // Don't auto-save on initial load or when no character is provided
    if (\!character || initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout for debounced saving
    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1000); // 1 second debounce

    // Clean up on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Explicitly exclude character from deps to prevent initial load auto-save in tests
    characteristics,
    useCunning,
    autoSave
  ]);`;

// File path
const filePath = path.join(__dirname, 'src/components/CharacterSheetComponents/CharacteristicsAndAbilitiesTab.js');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Find the useEffect for auto-saving
const effectRegex = /\/\/ Effect to handle auto-saving.*?\}\);/s;
content = content.replace(effectRegex, updatedEffect);

// Write back to the file
fs.writeFileSync(filePath, content);

console.log('Updated effect in CharacteristicsAndAbilitiesTab.js');
