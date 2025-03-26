#!/usr/bin/env node

/**
 * This script helps set up the abilities feature for Ars Saga Manager.
 * It will:
 * 1. Run the migrations for abilities tables
 * 2. Seed the reference abilities
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up Abilities feature for Ars Saga Manager...');

// Function to run a command and log output
function runCommand(command, description) {
  console.log(`\n--- ${description} ---`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

// Path to the migration file
const migrationPath = path.join(__dirname, '../migrations/20250313000000-create-abilities-tables.js');
const seederPath = path.join(__dirname, '../seeders/20250313000000-seed-reference-abilities.js');
const sqlPath = path.join(__dirname, '../scripts/create-abilities-tables.sql');

// Check if SQL file exists
if (!fs.existsSync(sqlPath)) {
  console.error(`❌ SQL file not found at: ${sqlPath}`);
  process.exit(1);
}

// Step 1: Run migration
console.log('Running migration for abilities tables...');
const migrationSuccess = runCommand(
  'npx sequelize-cli db:migrate',
  'Migration'
);

// Step 2: Run seeders
if (migrationSuccess) {
  console.log('Running seeders for reference abilities...');
  runCommand(
    'npx sequelize-cli db:seed --seed 20250313000000-seed-reference-abilities.js',
    'Seeding reference abilities'
  );
}

console.log('\n--- Alternative Setup Instructions ---');
console.log('If the migration and seeding do not work, you can use the SQL script to set up the database manually:');
console.log(`1. Connect to your PostgreSQL database`);
console.log(`2. Run the SQL file at: ${sqlPath}`);
console.log('   Example: psql -d ars_saga_manager -f scripts/create-abilities-tables.sql');

console.log('\nSetup process completed.');