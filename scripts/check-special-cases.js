/**
 * Script to check special cases with max_selections = 2
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

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
    
    // Check virtues/flaws with max_selections = 2
    const [specialCases] = await sequelize.query(`
      SELECT id, name, type, size, category, max_selections
      FROM reference_virtues_flaws
      WHERE max_selections = 2
      ORDER BY name
    `);
    
    console.log('\nVirtues/flaws with max_selections = 2:');
    if (specialCases.length === 0) {
      console.log('None found');
    } else {
      specialCases.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.type}, ${item.size}): max_selections = ${item.max_selections}`);
      });
    }
    
    // Check the expected special cases
    const expectedSpecialCases = [
      'Affinity with (Art)',
      'Affinity with (Ability)',
      'Puissant (Art)',
      'Puissant (Ability)',
      'Great Characteristic',
      'Quiet Magic',
      'Weak Characteristics'
    ];
    
    console.log('\nChecking for expected special cases:');
    for (const caseName of expectedSpecialCases) {
      const [result] = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM reference_virtues_flaws
        WHERE name = '${caseName}' AND max_selections = 2
      `);
      
      const found = result[0].count > 0;
      console.log(`- ${caseName}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await sequelize.close();
  }
}

main(); 