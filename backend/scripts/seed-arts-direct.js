'use strict';

require('dotenv').config();
const { Pool } = require('pg');

async function seedArts() {
  // Connect directly to the database
  const pool = new Pool({
    user: process.env.DB_APP_USERNAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'ars_saga_manager',
    password: process.env.DB_APP_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  });

  try {
    // First check if the table exists
    const checkTable = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reference_arts'
      );
    `);

    if (!checkTable.rows[0].exists) {
      console.log('Creating reference_arts table...');
      
      // Create the table if it doesn't exist - add public schema explicitly
      await pool.query(`
        CREATE TABLE IF NOT EXISTS public.reference_arts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          type VARCHAR(255) NOT NULL CHECK (type IN ('TECHNIQUE', 'FORM')),
          description TEXT
        );
      `);
    }

    // Check if we have any arts already to avoid duplicates
    const artsCount = await pool.query('SELECT COUNT(*) FROM public.reference_arts');
    if (parseInt(artsCount.rows[0].count) > 0) {
      console.log(`Skipping seeder - already have ${artsCount.rows[0].count} arts in the database`);
      await pool.end();
      return;
    }

    // Define the arts data
    const techniques = [
      ['Creo', 'TECHNIQUE', 'The Art of creation, making things from nothing or making things whole'],
      ['Intellego', 'TECHNIQUE', 'The Art of perception and knowledge, gaining information'],
      ['Muto', 'TECHNIQUE', 'The Art of transformation, changing the essential nature of something'],
      ['Perdo', 'TECHNIQUE', 'The Art of destruction and degradation'],
      ['Rego', 'TECHNIQUE', 'The Art of control and command, manipulating things according to their nature']
    ];
    
    const forms = [
      ['Animal', 'FORM', 'The Form of animals and animal products'],
      ['Aquam', 'FORM', 'The Form of water and liquids'],
      ['Auram', 'FORM', 'The Form of air and weather'],
      ['Corpus', 'FORM', 'The Form of human bodies'],
      ['Herbam', 'FORM', 'The Form of plants and plant products'],
      ['Ignem', 'FORM', 'The Form of fire and heat'],
      ['Imaginem', 'FORM', 'The Form of images, sounds, and sensory species'],
      ['Mentem', 'FORM', 'The Form of minds and thoughts'],
      ['Terram', 'FORM', 'The Form of earth and solid materials'],
      ['Vim', 'FORM', 'The Form of magical power itself']
    ];

    // Insert the arts
    console.log('Inserting Hermetic Arts...');
    const insertPromises = [...techniques, ...forms].map(art => {
      return pool.query(
        'INSERT INTO public.reference_arts(name, type, description) VALUES($1, $2, $3)',
        art
      );
    });

    await Promise.all(insertPromises);
    console.log('Hermetic Arts successfully seeded!');
  } catch (error) {
    console.error('Error seeding arts:', error);
  } finally {
    await pool.end();
  }
}

seedArts().catch(err => {
  console.error('Error in seed script:', err);
  process.exit(1);
});