# Database Timestamp Standardization

## Task ID
DB-TimestampStandardization

## Problem Statement
The database has inconsistent timestamp column naming across different tables. Some tables use camelCase (`createdAt`, `updatedAt`) while others use snake_case (`created_at`, `updated_at`). This inconsistency causes errors when including related models in Sequelize queries, particularly when working with associations between `ReferenceVirtueFlaw` and other models.

## Components Involved
- Database migrations
- Sequelize models
- API routes that query related models

## Implementation Details

### Immediate Workaround
We've implemented a workaround by:

1. Creating a new utility file (`utils/modelIncludeUtils.js`) with helper functions:
   - `safeReferenceVirtueFlawInclude()`: Creates a safe include object for the ReferenceVirtueFlaw model
   - `safeCharacterVirtueFlawsInclude()`: Creates a safe include object for the CharacterVirtueFlaw model with nested ReferenceVirtueFlaw

2. Adding documentation in `TIMESTAMP-ATTRIBUTES.md` to guide developers

3. Updating all affected queries to use these utility functions

### Permanent Fix

A migration (`20250401000000-standardize-timestamp-columns.js`) has been created to:

1. Check if the `reference_virtues_flaws` table has camelCase timestamp columns
2. Rename those columns to snake_case if they exist

The `ReferenceVirtueFlaw` model has also been updated to ensure consistent use of underscored naming:
```javascript
{
  sequelize,
  modelName: 'ReferenceVirtueFlaw',
  tableName: 'reference_virtues_flaws',
  underscored: true,
  timestamps: true
}
```

## Migration Process

To apply the fixes, run the following:

```bash
cd backend
npx sequelize-cli db:migrate
```

This will execute the migration to standardize timestamp column names.

## Affected Areas

The following files were updated:
- `/backend/services/experienceService.js`
- `/backend/routes/abilities.js`
- `/backend/models/ReferenceVirtueFlaw.js`

New files created:
- `/backend/utils/modelIncludeUtils.js`
- `/backend/migrations/20250401000000-standardize-timestamp-columns.js`
- `/Documentation/TIMESTAMP-ATTRIBUTES.md`

## Verification Steps

1. Run the standardization migration
2. Test adding abilities to characters
3. Test increasing experience points for abilities
4. Verify virtues that affect abilities (like Puissant and Affinity) work correctly

## Status
Completed

## Notes

This fix addresses a deeper issue with model timestamps in Sequelize. The standardization helps ensure consistent naming across the database.

For any future models:
- Always use `underscored: true` in model definitions
- Explicitly set `timestamps: true` for clarity
- Use snake_case (`created_at`, `updated_at`) for timestamp columns