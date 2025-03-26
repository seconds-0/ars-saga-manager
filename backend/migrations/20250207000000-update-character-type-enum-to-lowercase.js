'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, update existing data to lowercase
    await queryInterface.sequelize.query(`
      UPDATE characters 
      SET character_type = LOWER(character_type::text)::enum_characters_character_type;
    `);

    // Create new ENUM type with lowercase values
    await queryInterface.sequelize.query(`
      -- Create new ENUM type
      CREATE TYPE "enum_characters_character_type_new" AS ENUM ('grog', 'companion', 'magus');

      -- Update the column to use the new type
      ALTER TABLE characters 
      ALTER COLUMN character_type TYPE "enum_characters_character_type_new" 
      USING (LOWER(character_type::text)::enum_characters_character_type_new);

      -- Drop old ENUM type
      DROP TYPE "enum_characters_character_type";

      -- Rename new ENUM type to original name
      ALTER TYPE "enum_characters_character_type_new" RENAME TO "enum_characters_character_type";
    `);
  },

  async down(queryInterface, Sequelize) {
    // Create new ENUM type with capitalized values
    await queryInterface.sequelize.query(`
      -- Create new ENUM type
      CREATE TYPE "enum_characters_character_type_new" AS ENUM ('Grog', 'Companion', 'Magus');

      -- Update the column to use the new type
      ALTER TABLE characters 
      ALTER COLUMN character_type TYPE "enum_characters_character_type_new" 
      USING (INITCAP(character_type::text)::enum_characters_character_type_new);

      -- Drop old ENUM type
      DROP TYPE "enum_characters_character_type";

      -- Rename new ENUM type to original name
      ALTER TYPE "enum_characters_character_type_new" RENAME TO "enum_characters_character_type";
    `);
  }
}; 