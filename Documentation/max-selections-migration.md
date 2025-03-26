# Max Selections Migration Documentation

## Overview

This migration moves the business logic for virtue/flaw maximum selection limits from the frontend to the database where it belongs. Previously, the frontend code was enforcing rules like "Affinity with Art can be selected twice" while most virtues/flaws could only be selected once.

## Technical Details

### Database Changes

1. **Migration File**: `backend/migrations/20250228000000-set-max-selections-for-virtues-flaws.js`
2. **Changes Made**:
   - Set `max_selections = 1` for all virtues/flaws where it was NULL
   - Set `max_selections = 2` for special cases:
     - Affinity with Art/Ability
     - Puissant Art/Ability
     - Great Characteristic
     - Quiet Magic
     - Weak Characteristics
   - Add NOT NULL constraint with DEFAULT 1 to the `max_selections` column in the `reference_virtues_flaws` table

### Frontend Changes

1. **File Modified**: `frontend/src/components/CharacterSheetComponents/VirtueFlawSelector.js`
2. **Changes Made**:
   - Removed the hardcoded logic that was setting default `max_selections` values
   - The frontend now just uses the values provided by the API, which come from the database

## Why This Change Matters

Moving the business logic from the frontend to the database provides several important benefits:

1. **Single Source of Truth**: All applications that use the database will enforce the same rules
2. **Maintainability**: Changing rules requires only database updates, not code changes
3. **Data Integrity**: Rules are enforced at the database level, preventing inconsistencies
4. **Scalability**: Adding new special cases doesn't require frontend code changes

## Migration Status

✅ **Migration Completed Successfully**:

- The `max_selections` column now has a NOT NULL constraint with DEFAULT 1
- Special virtues/flaws have `max_selections = 2` as intended
- The frontend has been updated to use these values directly from the database

## Verification

The verification script confirms:

- No NULL values exist for `max_selections`
- Special cases have `max_selections = 2`
- All other records have `max_selections = 1`
- The NOT NULL constraint and DEFAULT value are properly set

## Conclusion

This migration successfully completes the transition of business logic from the frontend to the database. The application now properly enforces selection limits based on the database values, providing a more maintainable and consistent user experience.

If additional virtues/flaws need special maximum selection limits in the future, simply update their records in the database - no code changes will be needed.

## How to Run the Migration

### For Windows Users

Run the PowerShell script:

```
.\scripts\run-max-selections-migration.ps1
```

### For Linux/Mac Users

Run the bash script:

```
chmod +x scripts/run-max-selections-migration.sh
./scripts/run-max-selections-migration.sh
```

### Manual Execution

If the scripts don't work for you, follow these steps:

1. **Check Pre-migration State**:

   ```
   node scripts/verify-max-selections-migration.js pre
   ```

2. **Run the Migration**:

   ```
   cd backend
   npx sequelize-cli db:migrate --name 20250228000000-set-max-selections-for-virtues-flaws.js
   cd ..
   ```

3. **Check Post-migration State**:
   ```
   node scripts/verify-max-selections-migration.js post
   ```

## Troubleshooting

If the migration fails:

1. Check database connectivity
2. Verify database user has ALTER TABLE permissions
3. Check if there are conflicting migrations
4. Check the database logs for specific error messages

## Rolling Back

If necessary, you can roll back the migration with:

```
cd backend
npx sequelize-cli db:migrate:undo --name 20250228000000-set-max-selections-for-virtues-flaws.js
cd ..
```

Note: This will only remove the NOT NULL constraint and DEFAULT value. The data changes (setting values to 1 or 2) will not be reverted.
