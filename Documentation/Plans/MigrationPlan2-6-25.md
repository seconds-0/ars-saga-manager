# Migration Plan: Update databaseSchema.txt and Create Megamigration (2025-02-06)

This document outlines the step-by-step plan to update `Documentation/databaseSchema.txt` to accurately reflect the **current database schema as defined by the Sequelize models and migrations**. `Documentation/databaseSchema.txt` is intended to be a human-readable documentation file of the database schema. We will create a new "megamigration" that codifies the current schema from scratch. This approach will ensure consistency, simplify future database management, and provide an accurate representation of the database structure in `Documentation/databaseSchema.txt`.

**Phase 1: Analyze Current Schema and Plan Megamigration**

1.  **Review Current Models:**

    - **Task:** Thoroughly examine each Sequelize model file to understand the current database structure. **The Sequelize models are the primary source of truth for the database schema.**
    - **Location of Model Files:** Model files are located in the `backend/models/` directory. Specifically, review the following files:
      - `backend/models/Character.js`
      - `backend/models/CharacterVirtueFlaw.js`
      - `backend/models/House.js`
      - `backend/models/ReferenceVirtueFlaw.js`
      - `backend/models/User.js`
    - **Action:** For each model, identify and document the following:
      - Table name
      - Column names
      - Data types for each column (e.g., INTEGER, STRING, DATE, JSONB, ENUM)
      - Primary keys
      - Auto-incrementing columns
      - `allowNull` constraints (not nullable columns)
      - Default values
      - Unique constraints
      - Foreign key relationships and constraints
      - ENUM types and their possible values (look for `Sequelize.ENUM(...)`)
      - Associations defined in the models (e.g., `belongsTo`, `hasMany`, `belongsToMany`)
      - Validations defined in the models (though these are not directly reflected in the schema, they are good to note)

2.  **Plan Megamigration Structure:**

    - **Task:** Plan the structure of the new megamigration file. This megamigration will be designed to _create_ the database schema that is currently defined by your Sequelize models.
    - **Action:**
      - Create a new migration file in `backend/migrations/`. Use a timestamp-based naming convention, for example: `backend/migrations/20250206000000-megamigration-v2.js`. The `20250206` represents the date (YearMonthDay) and `000000` is a timestamp to ensure ordering. `v2` indicates this is the second version of a megamigration, if needed in the future.
      - The migration file will contain two main functions: `up` and `down`.
        - `up` function: This function will define the database schema creation, mirroring the schema defined in your models. It will use `queryInterface.createTable` to create each table and `queryInterface.sequelize.query` to create ENUM types.
        - `down` function: This function will define the database schema rollback (dropping tables and ENUMs), reversing the `up` function. It will use `queryInterface.dropTable` and `queryInterface.sequelize.query` with `DROP TYPE IF EXISTS`. It's crucial that the `down` function reverses the actions of the `up` function.

3.  **Document Current Schema (Manual Draft for `databaseSchema.txt`):**
    - **Task:** Based on the model analysis in Step 1, manually draft a new `Documentation/databaseSchema.txt` file. **This `databaseSchema.txt` file is for documentation purposes only and is what we are aiming to update to be accurate.**
    - **Action:**
      - Create a draft of `Documentation/databaseSchema.txt`.
      - For each table (Users, Houses, ReferenceVirtueFlaws, Characters, character_virtues_flaws), list the columns with their properties.
      - Follow the format of the existing `Documentation/databaseSchema.txt` (startLine: 1, endLine: 45). Example format:
        ```
        TableName
          ├─ columnName (dataType, nullable/not nullable, other constraints)
        ```
      - Ensure this draft includes all tables, columns, data types, nullability, and constraints identified in Step 1 from the models. This draft will be your target for the `databaseSchema.txt` documentation and will be refined after the megamigration is implemented and tested.

**Phase 2: Implement Megamigration and Update `databaseSchema.txt`**

4.  **Implement Megamigration `up` function:**

    - **Task:** Write the `up` function in the newly created megamigration file (`backend/migrations/20250206000000-megamigration-v2.js`). This function will generate the SQL to create the database schema based on your models.
    - **Action:**
      - Use `queryInterface.sequelize.query` to create ENUM types _first_, before they are used in table definitions. Refer to existing migrations like `backend/migrations/20240103000000-megamigration.js` for examples of ENUM creation using `DO $$ BEGIN IF NOT EXISTS ... END $$;`. Create `enum_characters_charactertype` and `enum_character_virtues_flaws_house_virtue_type`.
      - Use `queryInterface.createTable('TableName', { ...columnDefinitions... })` to create each table (`Users`, `Houses`, `ReferenceVirtueFlaws`, `Characters`, `CharacterVirtueFlaws`). These table definitions should directly reflect the structure defined in your Sequelize models.
      - For each column in `createTable`, define the column properties based on your model analysis from Step 1, ensuring they match the model definitions. Include:
        - `type`: Sequelize data type (e.g., `Sequelize.INTEGER`, `Sequelize.STRING`, `Sequelize.DATE`, `Sequelize.JSONB`, `Sequelize.ENUM`).
        - `primaryKey: true` for primary key columns.
        - `autoIncrement: true` for auto-incrementing primary keys (typically for `id` columns).
        - `allowNull: false` for not nullable columns. Omit `allowNull: true` for nullable columns (or explicitly set it to `true` for clarity).
        - `defaultValue: ...` for default values.
        - `unique: true` for unique constraints.
        - `references: { model: 'RelatedTableName', key: 'relatedColumnName' }` and `onUpdate: 'CASCADE'`, `onDelete: 'CASCADE'` for foreign key constraints. Ensure you understand the desired `onUpdate` and `onDelete` behavior (CASCADE, SET NULL, RESTRICT, etc.). These should reflect the associations defined in your models.
      - Create tables in a logical order, considering foreign key dependencies. For example, create `Users` and `Houses` before `Characters` if `Characters` has foreign keys to them, mirroring the relationships in your models.

5.  **Implement Megamigration `down` function:**

    - **Task:** Write the `down` function in the megamigration file. This function will define how to rollback the schema changes, effectively dropping all tables and ENUM types created in the `up` function.
    - **Action:**
      - Use `queryInterface.dropTable('TableName')` to drop each table in the _reverse order_ of their creation in the `up` function. For example, if you created tables in the order Users, Houses, Characters, CharacterVirtueFlaws, then drop them in the order CharacterVirtueFlaws, Characters, Houses, Users.
      - Use `queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_typeName";')` to drop the ENUM types (`enum_characters_charactertype`, `enum_character_virtues_flaws_house_virtue_type`) in reverse order of their creation in the `up` function. Use `DROP TYPE IF EXISTS` to avoid errors if the type doesn't exist during rollback in some scenarios.

6.  **Test Megamigration (Crucial Step - for Documentation Accuracy):**

    - **Task:** Thoroughly test the megamigration in a development or test environment to ensure it accurately reflects the schema defined by your models. **This testing is primarily to validate that the megamigration correctly generates the schema for documentation purposes and for potential future database setup from scratch. It is not intended to be run on a production database unless you intend to rebuild your database schema.**
    - **Action:**
      - **Set up a Test Database:** If you don't already have one, set up a separate development or test database environment. This is crucial for testing the migration without affecting your main development database.
      - **Run Migration:** Execute the megamigration using Sequelize CLI: `npx sequelize db:migrate`. This will apply the migration to your test database.
      - **Verify Schema:** After migration, use a database tool or Sequelize introspection to examine the database schema in your **test database**. Verify that:
        - All tables are created as expected based on your models.
        - All columns exist with the correct data types, nullability, and constraints, matching your models.
        - Primary keys, foreign keys, and unique constraints are correctly set up, as defined in your models.
        - ENUM types are created with the correct values, as used in your models.
        - The generated schema in the test database matches your drafted `Documentation/databaseSchema.txt` and, most importantly, your model definitions.
      - **Rollback Migration:** Rollback the migration using: `npx sequelize db:migrate:undo`. This will revert the changes in your test database.
      - **Verify Rollback:** Check that the database schema in your test database is correctly rolled back to its previous state. All tables and ENUM types created by the megamigration should be removed from the test database.
      - **Repeat Testing:** Repeat the migrate and rollback process a few times to ensure the migration is stable and reversible in your test environment and accurately reflects the schema defined by your models.

7.  **Update `Documentation/databaseSchema.txt` (Final - Accurate Documentation):**

    - **Task:** Once you are confident that the megamigration is correct and accurately creates the desired schema (and thus accurately reflects your models), update `Documentation/databaseSchema.txt` to reflect the _actual_ schema created by the megamigration in your test database. **This will make `Documentation/databaseSchema.txt` an accurate representation of your current database schema.**
    - **Action:**
      - Review the database schema in your test database after running the `up` migration one last time.
      - Carefully update your drafted `Documentation/databaseSchema.txt` to precisely match the schema in the test database. This final version of `Documentation/databaseSchema.txt` becomes the accurate documentation of your current database schema.

8.  **Optional: Remove Old Migrations (Advanced - Use with Caution):**
    - **Task:** Optionally clean up the `backend/migrations/` directory by removing older migration files. **This step is optional and should be done with extreme caution.** Since we are creating a megamigration that represents the full schema, older migrations might be considered less relevant for future schema evolution from this point onwards.
    - **Action (Proceed with Caution):**
      - **Backup:** Ensure you have a backup of your database and your `backend/migrations/` directory before deleting any files.
      - **Delete Old Files:** Delete all migration files in `backend/migrations/` that are _older_ than your new megamigration file (`20250206000000-megamigration-v2.js`).
      - **Update `SequelizeMeta` Table (If Necessary):** After deleting migration files, the `SequelizeMeta` table in your database might still list the names of the deleted migrations. If you want to completely clean up the migration history, you can manually edit the `SequelizeMeta` table to only contain the name of your new megamigration file. **Be extremely careful when modifying the `SequelizeMeta` table directly.** Incorrect modifications can break your migration system. It might be safer to leave the `SequelizeMeta` table as is if you are unsure.
      - **Consider Alternatives:** Instead of deleting old migrations, you could also consider archiving them to a separate directory if you want to keep a history but declutter the `migrations/` folder.

**Important Notes for Migration Best Practices:**

- **Test Environment:** Always test migrations in a development or test environment before considering applying them to any production or main development database. In this case, testing is crucial to ensure the megamigration accurately reflects your models and generates the correct schema documentation.
- **Backup:** While this megamigration is primarily for documentation and schema codification, it's always a good practice to back up your database before running any migrations, especially schema-altering migrations.
- **Version Control:** Keep your migrations under version control (Git).
- **Review Changes:** Carefully review the generated SQL in your megamigration before running it, even in a test environment.
- **Idempotency:** Migrations should be idempotent, meaning running the same migration multiple times should have the same effect as running it once (especially important for `up` functions). While `createTable` and `dropTable` are generally idempotent in themselves, be mindful if you add more complex logic in the future.
- **Atomicity (within a migration):** Each migration should ideally be atomic – either all changes in the `up` function are applied successfully, or none are (in case of errors, the transaction should rollback). Sequelize migrations are generally transactional.
- **Descriptive Names:** Use descriptive names for your migration files to easily understand their purpose.
- **One Change Per Migration (Generally):** While we are creating a megamigration here for simplification and documentation, in general, it's best practice to make smaller, incremental changes in separate migrations for ongoing development. Megamigrations are useful for initial setups or major refactorings like this documentation update, but for day-to-day changes, smaller migrations are preferred.

By following this detailed plan, you will be able to create a new megamigration that accurately defines your current database schema (as represented by your Sequelize models) and update your `Documentation/databaseSchema.txt` to serve as up-to-date and accurate documentation. Remember to proceed cautiously, test thoroughly in a test environment, and back up your data if you are applying this to a database with existing data (though for this documentation update, the primary goal is schema accuracy, not database modification).
