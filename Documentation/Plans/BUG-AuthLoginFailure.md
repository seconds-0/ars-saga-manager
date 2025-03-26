# BUG-AuthLoginFailure

## Task ID

BUG-AuthLoginFailure

## Problem Statement

Users are unable to log in to the application. The server responds with status code 500 (Internal Server Error) when attempting to log in. The error logs indicate an issue related to refresh token columns in the database, with a message suggesting that migrations need to be run.

## Components Involved

- Backend authentication routes (`/api/auth/login`)
- User model and database schema
- Database migrations
- Sequelize ORM configuration
- Frontend login component

## Dependencies

- PostgreSQL database
- Sequelize ORM
- Authentication middleware
- JWT and refresh token functionality

## Current State Analysis

### Error Symptoms

1. Server responds with a 500 Internal Server Error when users attempt to login
2. Console logs show "This might be due to missing columns from migration - run migration first"
3. Axios error in the browser console reporting "API Error 500: Error logging in"

### Database State

The application attempts to query the Users table with snake_case column names in SQL:

```sql
SELECT "id", "email", "password", "reset_password_token" AS "resetPasswordToken",
"reset_password_expires" AS "resetPasswordExpires", "failed_login_attempts" AS "failedLoginAttempts",
"account_locked_until" AS "accountLockedUntil", "refresh_token" AS "refreshToken",
"refresh_token_expires" AS "refreshTokenExpires", "created_at" AS "createdAt",
"updated_at" AS "updatedAt" FROM "Users" AS "User"
```

This suggests that Sequelize is correctly aliasing the snake_case database columns to camelCase JavaScript properties. However, the error persists.

### Model Configuration

The User model has `underscored: true` and defines camelCase property names:

```javascript
const User = sequelize.define(
  "User",
  {
    // Properties in camelCase
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    underscored: true,
    tableName: "Users",
  }
);
```

### Migration Status

Migration has been run to add refresh token columns:

```
20250321182513-add-refresh-token-to-users.js
```

The migration adds columns in snake_case:

```javascript
await queryInterface.addColumn("Users", "refresh_token", {
  type: Sequelize.STRING,
  allowNull: true,
  after: "account_locked_until",
});

await queryInterface.addColumn("Users", "refresh_token_expires", {
  type: Sequelize.DATE,
  allowNull: true,
  after: "refresh_token",
});
```

## Solutions Attempted

### Attempt 1: Run Database Migrations

Ran the following command to apply migrations:

```
cd backend && npx sequelize-cli db:migrate
```

Result: Migration successful according to `db:migrate:status`, but login still fails with the same error.

### Attempt 2: Add Explicit Field Mappings

Modified the User model to explicitly map camelCase properties to snake_case database columns:

```javascript
refreshToken: {
  type: DataTypes.STRING,
  allowNull: true,
  field: 'refresh_token'
},
refreshTokenExpires: {
  type: DataTypes.DATE,
  allowNull: true,
  field: 'refresh_token_expires'
}
```

Result: After restarting the server, login still fails with the same error.

### Attempt 3: Remove Explicit Field Mappings

Removed the explicit field mappings and relied on `underscored: true` to handle the conversion automatically:

```javascript
refreshToken: {
  type: DataTypes.STRING,
  allowNull: true
},
refreshTokenExpires: {
  type: DataTypes.DATE,
  allowNull: true
}
```

Result: Still encountering the 500 error when attempting to log in.

### Attempt 4: Enhanced Error Logging

Added detailed error logging to isolate the exact point of failure:

```javascript
// Enhanced error logging in login route
logger.debug('User object before update:', {
  id: user.id,
  model: user.constructor.name,
  hasRefreshTokenField: 'refreshToken' in user,
  hasRefreshTokenExpiresField: 'refreshTokenExpires' in user
});

// Added direct SQL query to check columns
const [columns] = await sequelize.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_name = 'Users' AND column_name IN ('refresh_token', 'refresh_token_expires')
`);

// Added fallback to direct SQL update
try {
  // Direct SQL update as fallback
  await sequelize.query(`
    UPDATE "Users" SET
    refresh_token = :token,
    refresh_token_expires = :expires
    WHERE id = :id
  `, {
    replacements: {...}
  });
} catch (sqlError) {
  // Enhanced error logging
}
```

Result: This provided more detailed error information, revealing that additional columns were missing.

### Attempt 5: Diagnostic Test Script

Created a diagnostic script to directly test refresh token functionality:

```javascript
// Test script to check database columns and refresh token operations
const user = await User.findOne();
// Error occurred: column "reset_password_token" does not exist
```

Result: This revealed the exact issue - the database was missing several required columns, not just the refresh token columns.

### Attempt 6: Schema Fix Script (SUCCESSFUL)

Created a script to identify and add all missing columns to the Users table:

```javascript
// Define required columns
const requiredColumns = [
  { name: "reset_password_token", type: "VARCHAR(255)", nullable: true },
  {
    name: "reset_password_expires",
    type: "TIMESTAMP WITH TIME ZONE",
    nullable: true,
  },
  {
    name: "failed_login_attempts",
    type: "INTEGER",
    nullable: false,
    default: 0,
  },
  {
    name: "account_locked_until",
    type: "TIMESTAMP WITH TIME ZONE",
    nullable: true,
  },
  { name: "refresh_token", type: "VARCHAR(255)", nullable: true },
  {
    name: "refresh_token_expires",
    type: "TIMESTAMP WITH TIME ZONE",
    nullable: true,
  },
];

// Add missing columns
for (const column of missingColumns) {
  await sequelize.query(
    `ALTER TABLE "Users" ADD COLUMN "${column.name}" ${column.type}`
  );
}
```

Result: Successfully added all missing columns to the Users table. Login now works correctly.

## Implementation Checklist

- [x] Verify migration status and ensure refresh token columns exist
- [x] Check model configuration for correct use of `underscored: true`
- [x] Try explicit field mappings in the model
- [x] Try removing explicit field mappings and rely on `underscored: true`
- [x] Examine the login route code for error handling or logic issues
- [x] Add enhanced error logging to the login route
- [x] Add a fallback mechanism using direct SQL queries
- [x] Check the database directly to verify column names and types
- [x] Create a simple test script to directly query the Users table
- [x] Identify missing columns in the database schema
- [x] Create a script to fix the database schema
- [x] Verify that login works after the schema fixes

## Verification Steps

1. User should be able to log in successfully
2. Backend should respond with 200 status code
3. User should be redirected to the home page after login
4. Refresh token should be properly stored in the database
5. No errors should appear in the server console or browser console

## Decision Authority

- Can independently implement database schema fixes
- Can modify model definitions to fix mapping issues
- Can add better error logging to diagnose the issue
- Need user input for database credential changes or environment variable modifications

## Questions/Uncertainties

### Blocking

1. Are there permission issues with the database user when accessing the columns?
2. Is there a schema mismatch between what Sequelize expects and what's in the database?
3. Are the refresh token columns actually created with the correct names in the database?

### Non-blocking

1. Are there additional fields in the User model that might be causing issues?
2. Could there be an issue with how the authentication tokens are generated or used?
3. Might there be configuration differences between development and production environments?

## Acceptable Tradeoffs

- Temporarily disabling refresh token functionality to get login working
- Adding more verbose error logging for diagnosis
- Using direct SQL queries instead of Sequelize if necessary to bypass ORM issues

## Status

Completed

## Next Steps

1. **Analyze Enhanced Error Logs**:

   - Review logs from the improved error logging to identify the exact failure point
   - Determine if the error occurs during token generation, validation, or database update

2. **Test Fallback SQL Approach**:

   - If the direct SQL update works but the ORM update fails, investigate ORM configuration issues
   - This would indicate a disconnect between the Sequelize model and the database schema

3. **Check PostgreSQL Version Compatibility**:

   - Verify that the PostgreSQL version being used is compatible with the Sequelize version
   - Look for any version-specific issues that might affect column naming or data types

4. **Database Column Audit**:

   - Create a script to audit all columns in the Users table with their correct data types
   - Verify that all expected columns exist with the correct types

5. **Temporary Workaround Options**:
   - If needed, implement a login flow that doesn't use refresh tokens as a temporary fix
   - This would allow users to log in while we resolve the underlying issue

## Notes

- The issue was ultimately a database schema mismatch, where the User model expected columns that didn't exist in the database
- While running migrations is typically the proper way to update the database schema, our direct schema fix was necessary in this case because some migrations may have been missing or incomplete
- The `underscored: true` option in Sequelize correctly mapped camelCase model fields to snake_case database columns, but couldn't compensate for completely missing columns
- For future database changes, make sure to create and test migrations thoroughly before deploying
