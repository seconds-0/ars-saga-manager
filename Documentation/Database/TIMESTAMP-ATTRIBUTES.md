# Important: Handling Timestamp Attributes in Sequelize Queries

## Issue Description

When querying models that include associations with the `ReferenceVirtueFlaw` model, timestamp attributes can cause errors due to inconsistent naming conventions between models.

The error typically appears as:
```
column referenceVirtueFlaw.createdAt does not exist
```

This happens because some models use underscored naming (`created_at`, `updated_at`) while others use camelCase (`createdAt`, `updatedAt`), and Sequelize's automatic attribute inclusion can trigger these issues.

## Solution Pattern

Always explicitly exclude timestamp attributes when including `ReferenceVirtueFlaw` in queries:

```javascript
const result = await SomeModel.findAll({
  include: [{
    model: ReferenceVirtueFlaw,
    as: 'referenceVirtueFlaw',
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at']
    }
  }]
});
```

## Affected Areas

This pattern should be applied in the following scenarios:

1. When querying `CharacterVirtueFlaw` with `ReferenceVirtueFlaw` included
2. When including `ReferenceVirtueFlaw` in ability-related queries
3. When working with virtues/flaws in the experience system
4. Any other queries that join models with `ReferenceVirtueFlaw`

## Implementation Details

The issue arises from timing differences in model development and inconsistent naming conventions. The `ReferenceVirtueFlaw` model was created with camelCase attribute names (`createdAt`, `updatedAt`), while newer models use underscored attribute names (`created_at`, `updated_at`).

When a query requires both naming conventions, Sequelize may attempt to reference columns that don't exist in the database with the expected name.

## Permanent Fix (Future)

A more permanent solution would be to standardize all timestamp attribute names across the database:

1. Create a migration to rename all timestamp columns to a consistent format
2. Update all model definitions to use the same convention
3. Update queries to match the new convention

However, until this standardization is completed, the attribute exclusion pattern should be used for all queries involving the affected models.