# Ars Saga Manager Backend

This is the backend API for the Ars Saga Manager, a character management system for Ars Magica 5th Edition.

## Recent Features

### Arts and Abilities Integration

The `feat/abilities-arts-integration` branch implements several key features:

1. **Reference Arts API**
   - Added ReferenceArt model with Techniques and Forms
   - Created API endpoints at `/api/reference-arts` and `/api/reference-arts/:id`
   - Added filtering by type (technique/form) with `/api/reference-arts?type=technique`

2. **Virtue/Flaw Enhancements**
   - Added ability to specify virtues/flaws that require selections (like Puissant or Affinity)
   - Enhanced ReferenceVirtueFlaw model with fields for ability bonuses and experience modifiers
   - Updated API to support these new fields and selection requirements

3. **Ability Score Calculation**
   - Added logic to calculate effective ability scores based on virtues like Puissant
   - Implemented experience cost modifications based on virtues like Affinity
   - Added utility functions to handle these calculations

4. **Experience System**
   - Added experience pools for general, magical, and restricted XP
   - Implemented priority-based experience spending system
   - Added transaction support for safe XP operations

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables (copy .env.example to .env)

3. Create the database:
   ```
   npx sequelize-cli db:create
   ```

4. Run migrations:
   ```
   npx sequelize-cli db:migrate
   ```

5. Seed reference data:
   ```
   npx sequelize-cli db:seed:all
   ```

6. For arts table creation (if needed):
   ```
   node create-arts-table-direct.js
   ```

7. Start the development server:
   ```
   npm run dev
   ```

## Testing

Run tests with:
```
npm test
```

## API Documentation

- Authentication: `/api/auth/login`, `/api/auth/register`
- Characters: `/api/characters`
- Virtues & Flaws: `/api/reference-virtues-flaws`
- Abilities: `/api/reference-abilities`
- Arts: `/api/reference-arts`