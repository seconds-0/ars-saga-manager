const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Update the path to look for .env in the backend directory
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Checking for .env file at:', envPath);
if (!fs.existsSync(envPath)) {
  console.error('.env file not found at the specified path');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Log environment variables (excluding the actual password)
console.log('Environment variables:');
console.log({
  DB_USERNAME: process.env.DB_DEV_USERNAME,
  DB_PASSWORD: process.env.DB_DEV_PASSWORD ? '[REDACTED]' : undefined,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
});

// Database connection configuration
const dbConfig = {
  user: process.env.DB_DEV_USERNAME,
  password: process.env.DB_DEV_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

// Log the database configuration (excluding the actual password)
console.log('Database configuration:');
console.log({
  ...dbConfig,
  password: dbConfig.password ? '[REDACTED]' : undefined,
});

// Modify the pool creation to include error handling
const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function generateDatabaseSchema() {
  let client;
  try {
    client = await pool.connect();
    const schemaQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;

    const result = await client.query(schemaQuery);
    const schema = result.rows;

    // Create the Documentation directory if it doesn't exist
    const documentationDir = path.resolve(__dirname, '..', '..', 'Documentation');
    if (!fs.existsSync(documentationDir)) {
      fs.mkdirSync(documentationDir, { recursive: true });
    }

    // Update the file path
    const schemaFilePath = path.join(documentationDir, 'databaseSchema.txt');
    
    // Generate the timestamp
    const timestamp = new Date().toISOString();

    // Prepare the content with the timestamp at the top
    const content = `CREATED AT: ${timestamp}\n\n` + 
      schema.map(row => `${row.table_name}\n  ├─ ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`).join('\n');

    // Write the schema to the file
    fs.writeFileSync(schemaFilePath, content);
    
    console.log(`Database schema has been written to ${schemaFilePath}`);
  } catch (err) {
    console.error('Error generating database schema:', err);
    console.error('Error details:', err.stack);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

generateDatabaseSchema();