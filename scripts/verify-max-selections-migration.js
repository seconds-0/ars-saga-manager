/**
 * Script to verify the state of max_selections before and after migration
 * 
 * To use:
 * 1. Run before migration: node scripts/verify-max-selections-migration.js pre
 * 2. Run after migration: node scripts/verify-max-selections-migration.js post
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Read database configuration from environment - using superuser credentials
// like the migration does
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_SUPERUSER_USERNAME,
  process.env.DB_SUPERUSER_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432,
    logging: false
  }
);

// Alternative: Use DATABASE_URL if the above doesn't work
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: 'postgres',
//   logging: false
// });

async function checkPreMigration() {
  console.log('===== PRE-MIGRATION STATE =====');
  
  // Count total records
  const [totalResults] = await sequelize.query(`
    SELECT COUNT(*) as total FROM reference_virtues_flaws
  `);
  console.log(`Total records: ${totalResults[0].total}`);
  
  // Count records with NULL max_selections
  const [nullResults] = await sequelize.query(`
    SELECT COUNT(*) as null_count FROM reference_virtues_flaws
    WHERE max_selections IS NULL
  `);
  console.log(`Records with NULL max_selections: ${nullResults[0].null_count}`);
  
  // Count records by max_selections value
  const [countByValue] = await sequelize.query(`
    SELECT max_selections, COUNT(*) as count 
    FROM reference_virtues_flaws
    GROUP BY max_selections
    ORDER BY max_selections
  `);
  console.log('Count by max_selections value:');
  countByValue.forEach(row => {
    console.log(`  ${row.max_selections === null ? 'NULL' : row.max_selections}: ${row.count}`);
  });
  
  // Check special cases
  const [specialCases] = await sequelize.query(`
    SELECT name, max_selections
    FROM reference_virtues_flaws
    WHERE name IN (
      'Affinity with Art',
      'Affinity with Ability',
      'Puissant Art',
      'Puissant Ability',
      'Great Characteristic'
    )
    ORDER BY name
  `);
  
  console.log('\nSpecial cases:');
  specialCases.forEach(row => {
    console.log(`  ${row.name}: ${row.max_selections === null ? 'NULL' : row.max_selections}`);
  });
}

async function checkPostMigration() {
  console.log('===== POST-MIGRATION STATE =====');
  
  // Count total records
  const [totalResults] = await sequelize.query(`
    SELECT COUNT(*) as total FROM reference_virtues_flaws
  `);
  console.log(`Total records: ${totalResults[0].total}`);
  
  // Count records with NULL max_selections (should be 0)
  const [nullResults] = await sequelize.query(`
    SELECT COUNT(*) as null_count FROM reference_virtues_flaws
    WHERE max_selections IS NULL
  `);
  console.log(`Records with NULL max_selections: ${nullResults[0].null_count}`);
  
  // Count records by max_selections value
  const [countByValue] = await sequelize.query(`
    SELECT max_selections, COUNT(*) as count 
    FROM reference_virtues_flaws
    GROUP BY max_selections
    ORDER BY max_selections
  `);
  console.log('Count by max_selections value:');
  countByValue.forEach(row => {
    console.log(`  ${row.max_selections}: ${row.count}`);
  });
  
  // Check special cases
  const [specialCases] = await sequelize.query(`
    SELECT name, max_selections
    FROM reference_virtues_flaws
    WHERE name IN (
      'Affinity with Art',
      'Affinity with Ability',
      'Puissant Art',
      'Puissant Ability',
      'Great Characteristic'
    )
    ORDER BY name
  `);
  
  console.log('\nSpecial cases (should all have max_selections = 2):');
  specialCases.forEach(row => {
    console.log(`  ${row.name}: ${row.max_selections}`);
  });
  
  // Verify NOT NULL constraint
  try {
    const [constraintInfo] = await sequelize.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'reference_virtues_flaws' AND column_name = 'max_selections'
    `);
    
    console.log('\nColumn constraint info:');
    console.log(`  Is Nullable: ${constraintInfo[0].is_nullable}`);
    console.log(`  Default Value: ${constraintInfo[0].column_default}`);
    
    if (constraintInfo[0].is_nullable === 'NO' && constraintInfo[0].column_default === '1') {
      console.log('\n✅ Migration successful! NOT NULL constraint and DEFAULT 1 are set properly.');
    } else {
      console.log('\n❌ Migration incomplete! Constraint or default value not set correctly.');
    }
  } catch (error) {
    console.error('Error checking constraint:', error);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    const mode = process.argv[2];
    if (mode === 'pre') {
      await checkPreMigration();
    } else if (mode === 'post') {
      await checkPostMigration();
    } else {
      console.error('Please specify "pre" or "post" to check before or after migration.');
      console.log('Example: node scripts/verify-max-selections-migration.js pre');
    }
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    await sequelize.close();
  }
}

main(); 