/**
 * Script to check what tables exist in the database
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Using superuser credentials from the .env file
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_SUPERUSER_USERNAME,
  process.env.DB_SUPERUSER_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Query to get all tables in the public schema
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\nTables in the database:');
    if (tables.length === 0) {
      console.log('No tables found');
    } else {
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name}`);
      });
    }
    
    // Check if our specific table exists, try different possibilities
    const tablesToCheck = [
      'reference_virtues_flaws', 
      'referenceVirtuesFlaws',
      'reference_virtue_flaws', 
      'referenceVirtueFlaws'
    ];
    
    console.log('\nChecking for specific tables:');
    for (const tableName of tablesToCheck) {
      try {
        const [result] = await sequelize.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          );
        `);
        console.log(`- ${tableName}: ${result[0].exists ? 'EXISTS' : 'NOT FOUND'}`);
      } catch (error) {
        console.error(`Error checking table ${tableName}:`, error.message);
      }
    }
    
    // Check migration status
    try {
      const [migrations] = await sequelize.query(`
        SELECT name FROM "SequelizeMeta" ORDER BY name
      `);
      
      console.log('\nApplied migrations:');
      migrations.forEach((migration, index) => {
        console.log(`${index + 1}. ${migration.name}`);
      });
      
      // Specifically check for our migration
      const ourMigration = migrations.find(m => m.name === '20250228000000-set-max-selections-for-virtues-flaws.js');
      if (ourMigration) {
        console.log('\n✅ Our migration has been applied successfully!');
      } else {
        console.log('\n❌ Our migration has NOT been applied.');
      }
    } catch (error) {
      console.error('Error checking migrations:', error.message);
    }
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await sequelize.close();
  }
}

main(); 