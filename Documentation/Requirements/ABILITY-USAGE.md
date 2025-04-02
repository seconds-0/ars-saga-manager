# Abilities System: Usage Guide

## Overview

The Abilities system in Ars Saga Manager allows characters to have skills and knowledge based on the Ars Magica 5th Edition rules. Abilities are organized into categories (General, Academic, Martial, Supernatural, and Arcane) and can be improved by spending experience points.

## Adding Abilities to a Character

1. Navigate to a character's sheet
2. Go to the "Characteristics & Abilities" tab
3. Use the "Add New Ability" panel to search for and select an ability
4. The ability will be added to the character at score 0

## Improving Abilities

Abilities can be improved by spending experience points:

1. Click the "+" button next to an ability to increase its score by 1
2. The cost will be automatically calculated and deducted from the character's available experience points
3. The cost increases with each level (5 XP for level 1, 10 XP for level 2, etc.)
4. Certain virtues like "Affinity" can reduce this cost

## Ability Specialties

Many abilities can have specialties, which provide a +1 bonus when using the ability in situations related to the specialty:

1. Enter a specialty in the text field next to the ability
2. The specialty is saved automatically

## Ability Categories

Abilities are divided into five categories:

1. **General**: Common skills like Animal Handling, Awareness, and Stealth
2. **Academic**: Intellectual skills like Artes Liberales, Medicine, and languages
3. **Martial**: Combat skills like Bow, Single Weapon, and Great Weapon
4. **Supernatural**: Mystical abilities like Second Sight and Dowsing
5. **Arcane**: Hermetic skills like Magic Theory and Parma Magica

## Character Type Restrictions

Not all character types can learn all abilities:

- **Magi** can learn any ability
- **Companions** can learn most abilities except certain arcane ones (like Parma Magica)
- **Grogs** have the most restrictions (no Supernatural abilities, limited Academic and Arcane abilities)

## Virtue and Flaw Effects

Certain virtues and flaws can affect abilities:

- **Puissant (Ability)**: Adds +2 to the effective score of an ability (shown in green)
- **Affinity with (Ability)**: Reduces the XP cost to improve an ability by 25%
- **Book Learner**: Reduces the XP cost of Academic abilities by 25%
- **Inept (Ability)**: Makes an ability harder to improve
- **Higher Standard**: Increases the experience points needed to improve abilities

## Backend Technical Details

Abilities are implemented using two main database tables:

- `reference_abilities`: Standard ability definitions
- `character_abilities`: Character-specific abilities with scores and specialties

Experience costs and score calculations are handled by the `abilityUtils.js` utility functions.

## Commands for Setting Up Abilities

To set up abilities in a fresh installation:

```bash
# From the project root
node scripts/setup-abilities.js
```

This will run the necessary migrations and seeders to populate the abilities database.

## API Endpoints

The following API endpoints are available for abilities:

- `GET /api/reference-abilities`: Get all reference abilities
- `GET /api/reference-abilities/category/:category`: Get abilities by category
- `GET /api/characters/:characterId/abilities`: Get a character's abilities
- `POST /api/characters/:characterId/abilities`: Add a new ability to a character
- `PUT /api/characters/:characterId/abilities/:abilityId`: Update an ability
- `DELETE /api/characters/:characterId/abilities/:abilityId`: Remove an ability

Each ability has a calculated `score` based on its `experience_points`, as well as an `effective_score` that includes bonuses from virtues.