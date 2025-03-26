'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Set max_selections = 1 for all records where it's NULL
    await queryInterface.sequelize.query(`
      UPDATE reference_virtues_flaws
      SET max_selections = 1
      WHERE max_selections IS NULL
    `);

    // Step 2: Update the special cases to have max_selections = 2
    await queryInterface.sequelize.query(`
      UPDATE reference_virtues_flaws
      SET max_selections = 2
      WHERE name IN (
        'Affinity with (Art)',
        'Affinity with (Ability)',
        'Puissant (Art)',
        'Puissant (Ability)',
        'Great Characteristic',
        'Quiet Magic',
        'Weak Characteristics'
      )
    `);

    // Step 3: Add a NOT NULL constraint with DEFAULT 1
    await queryInterface.sequelize.query(`
      ALTER TABLE reference_virtues_flaws
      ALTER COLUMN max_selections SET NOT NULL,
      ALTER COLUMN max_selections SET DEFAULT 1
    `);

    // Log completion
    console.log('Migration completed: Set max_selections for all virtues and flaws');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the NOT NULL constraint and DEFAULT value
    await queryInterface.sequelize.query(`
      ALTER TABLE reference_virtues_flaws
      ALTER COLUMN max_selections DROP NOT NULL,
      ALTER COLUMN max_selections DROP DEFAULT
    `);

    // Note: We don't revert the data changes as that would be destructive
    // If absolutely needed, we would need to restore from a backup
    console.log('Migration reverted: Removed NOT NULL constraint and DEFAULT for max_selections');
  }
}; 