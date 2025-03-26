Backend fail: $ npm run start:all

> ars-saga-manager@1.0.0 start:all
> node scripts/start-all.js

Compiled with warnings.

[eslint]
src\components\CharacterSheetComponents\VirtueFlawSelector.js
Line 31:27: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead react-hooks/exhaustive-deps

src\components\CharacterSheetComponents\VirtuesAndFlawsTab.js
Line 47:6: React Hook useMemo has a missing dependency: 'character'. Either include it or remove the dependency array react-hooks/exhaustive-deps

src\useAuth.js
Line 31:6: React Hook useCallback has a missing dependency: 'logout'. Either include it or remove the dependency array react-hooks/exhaustive-deps

src\utils\virtueFlawValidation.js
Line 7:7: 'normalizeCharacterType' is assigned a value but never used no-unused-vars
Line 328:7: 'validateGrogRestrictions' is assigned a value but never used no-unused-vars
Line 392:7: 'validatePointBalance' is assigned a value but never used no-unused-vars
Line 452:7: 'validateSocialStatus' is assigned a value but never used no-unused-vars
Line 474:7: 'validateIncompatibilities' is assigned a value but never used no-unused-vars
Line 509:7: 'validatePrerequisites' is assigned a value but never used no-unused-vars
Line 546:7: 'validateMajorHermeticVirtues' is assigned a value but never used no-unused-vars
Line 569:7: 'validateStoryFlaws' is assigned a value but never used no-unused-vars
Line 591:7: 'validatePersonalityFlaws' is assigned a value but never used no-unused-vars

Search for the keywords to learn more about each warning.
To ignore, add // eslint-disable-next-line to the line before.

WARNING in [eslint]
src\components\CharacterSheetComponents\VirtueFlawSelector.js
Line 31:27: React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead react-hooks/exhaustive-deps

src\components\CharacterSheetComponents\VirtuesAndFlawsTab.js
Line 47:6: React Hook useMemo has a missing dependency: 'character'. Either include it or remove the dependency array react-hooks/exhaustive-deps

src\useAuth.js
Line 31:6: React Hook useCallback has a missing dependency: 'logout'. Either include it or remove the dependency array react-hooks/exhaustive-deps

src\utils\virtueFlawValidation.js
Line 7:7: 'normalizeCharacterType' is assigned a value but never used no-unused-vars
Line 328:7: 'validateGrogRestrictions' is assigned a value but never used no-unused-vars
Line 392:7: 'validatePointBalance' is assigned a value but never used no-unused-vars
Line 452:7: 'validateSocialStatus' is assigned a value but never used no-unused-vars
Line 474:7: 'validateIncompatibilities' is assigned a value but never used no-unused-vars
Line 509:7: 'validatePrerequisites' is assigned a value but never used no-unused-vars
Line 546:7: 'validateMajorHermeticVirtues' is assigned a value but never used no-unused-vars
Line 569:7: 'validateStoryFlaws' is assigned a value but never used no-unused-vars
Line 591:7: 'validatePersonalityFlaws' is assigned a value but never used no-unused-vars

webpack compiled with 1 warning
