/**
 * Setup Abilities Script
 * 
 * This script runs the abilities migration and seeder to set up ability data in the database.
 * It's designed to be run from the project root.
 */

const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Check if we're in the right directory
if (!fs.existsSync('./backend') || !fs.existsSync('./frontend')) {
  console.error('Error: Script must be run from the project root directory');
  process.exit(1);
}

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log(`${colors.cyan}Ars Saga Manager - Abilities Setup${colors.reset}`);
console.log(`${colors.cyan}======================================${colors.reset}\n`);

try {
  // Step 1: Run the abilities migration
  console.log(`${colors.yellow}Step 1: Running abilities migration...${colors.reset}`);
  
  const migrationCommand = `cd backend && npx sequelize-cli db:migrate --to 20250313000000-create-abilities-tables.js`;
  console.log(`Executing: ${migrationCommand}`);
  
  execSync(migrationCommand, { stdio: 'inherit' });
  
  console.log(`${colors.green}Migration completed successfully!${colors.reset}\n`);

  // Step 2: Run the abilities seeder
  console.log(`${colors.yellow}Step 2: Running abilities seeder...${colors.reset}`);
  
  const seederCommand = `cd backend && npx sequelize-cli db:seed --seed 20250313000000-seed-reference-abilities.js`;
  console.log(`Executing: ${seederCommand}`);
  
  execSync(seederCommand, { stdio: 'inherit' });
  
  console.log(`${colors.green}Seeder completed successfully!${colors.reset}\n`);

  // Success message with instructions
  console.log(`${colors.green}Abilities setup completed successfully!${colors.reset}`);
  console.log(`${colors.magenta}The following has been set up:${colors.reset}`);
  console.log(`- Reference abilities table created`);
  console.log(`- Character abilities table created`);
  console.log(`- All standard Ars Magica 5e abilities seeded to the database`);
  console.log(`\n${colors.cyan}You can now use abilities in your characters.${colors.reset}`);

} catch (error) {
  console.error(`${colors.red}Error during setup:${colors.reset}`, error.message);
  console.error(`${colors.yellow}For manual setup, run these commands:${colors.reset}`);
  console.error(`  cd backend`);
  console.error(`  npx sequelize-cli db:migrate --to 20250313000000-create-abilities-tables.js`);
  console.error(`  npx sequelize-cli db:seed --seed 20250313000000-seed-reference-abilities.js`);
  process.exit(1);
}