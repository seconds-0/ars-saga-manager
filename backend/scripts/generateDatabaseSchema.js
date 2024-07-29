const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Database connection configuration
const dbConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

const pool = new Pool(dbConfig);

async function generateDatabaseSchema() {
  const client = await pool.connect();
  try {
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

    let output = `Database Schema (Generated on ${new Date().toLocaleString()})\n\n`;
    let currentTable = '';

    schema.forEach(row => {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        output += `${currentTable}\n`;
      }
      output += `  ├─ ${row.column_name} (${row.data_type}, ${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})\n`;
    });

    const outputPath = path.resolve(__dirname, 'databaseSchema.txt');
    fs.writeFileSync(outputPath, output);
    console.log(`Database schema has been written to ${outputPath}`);
  } catch (err) {
    console.error('Error generating database schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

generateDatabaseSchema();