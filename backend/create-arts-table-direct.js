require('dotenv').config();
const { Sequelize } = require('sequelize');
const { exec } = require('child_process');

async function runDirectSql() {
  console.log('Creating arts table directly using SQL...');
  
  // Create a direct connection to the database
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'ars_saga_manager',
    process.env.DB_APP_USERNAME || 'postgres',
    process.env.DB_APP_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if the ENUM type already exists
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_art_type') THEN
            CREATE TYPE "enum_art_type" AS ENUM ('TECHNIQUE', 'FORM');
          END IF;
        END$$;
      `);
      console.log('Art type ENUM created or already exists.');
    } catch (enumError) {
      console.error('Error creating ENUM:', enumError);
    }

    // Create the reference_arts table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS public.reference_arts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('TECHNIQUE', 'FORM')),
        description TEXT
      );
    `);
    console.log('Table reference_arts created or already exists.');

    // Check if we already have arts
    const [results] = await sequelize.query('SELECT COUNT(*) FROM public.reference_arts');
    const count = parseInt(results[0].count);
    
    if (count > 0) {
      console.log(`Skipping insert - already have ${count} arts in the database.`);
    } else {
      // Define the arts data
      console.log('Inserting Hermetic Arts...');
      
      // Add techniques
      await sequelize.query(`
        INSERT INTO public.reference_arts (name, type, description) VALUES
        ('Creo', 'TECHNIQUE', 'The Art of creation, making things from nothing or making things whole'),
        ('Intellego', 'TECHNIQUE', 'The Art of perception and knowledge, gaining information'),
        ('Muto', 'TECHNIQUE', 'The Art of transformation, changing the essential nature of something'),
        ('Perdo', 'TECHNIQUE', 'The Art of destruction and degradation'),
        ('Rego', 'TECHNIQUE', 'The Art of control and command, manipulating things according to their nature'),
        ('Animal', 'FORM', 'The Form of animals and animal products'),
        ('Aquam', 'FORM', 'The Form of water and liquids'),
        ('Auram', 'FORM', 'The Form of air and weather'),
        ('Corpus', 'FORM', 'The Form of human bodies'),
        ('Herbam', 'FORM', 'The Form of plants and plant products'),
        ('Ignem', 'FORM', 'The Form of fire and heat'),
        ('Imaginem', 'FORM', 'The Form of images, sounds, and sensory species'),
        ('Mentem', 'FORM', 'The Form of minds and thoughts'),
        ('Terram', 'FORM', 'The Form of earth and solid materials'),
        ('Vim', 'FORM', 'The Form of magical power itself')
      `);
      
      console.log('Hermetic Arts successfully seeded!');
    }

    await sequelize.close();
    console.log('Database connection closed.');
    console.log('Now try starting the server with: npm run dev');
  } catch (error) {
    console.error('Error:', error);
    await sequelize.close();
  }
}

runDirectSql().catch(err => {
  console.error('Unexpected error:', err);
});