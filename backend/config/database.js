const path = require('path');
const fs = require('fs');

// Array of possible .env file locations
const possibleEnvPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];

let envPath;
for (const possiblePath of possibleEnvPaths) {
  if (fs.existsSync(possiblePath)) {
    envPath = possiblePath;
    break;
  }
}

console.log('Full path to .env:', path.resolve(__dirname, '../.env'));
console.log('File exists:', fs.existsSync(path.resolve(__dirname, '../.env')));

if (envPath) {
  console.log('.env file found at:', envPath);
  const result = require('dotenv').config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('.env file loaded successfully');
  }
} else {
  console.error('No .env file found in any of the following locations:');
  possibleEnvPaths.forEach(path => console.log(' -', path));
}

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

// Log only relevant environment variables
const relevantEnvVars = [
  'DB_SUPERUSER_USERNAME', 'DB_SUPERUSER_PASSWORD', 'DB_DEV_USERNAME', 
  'DB_DEV_PASSWORD', 'DB_APP_USERNAME', 'DB_APP_PASSWORD', 
  'DB_NAME', 'DB_HOST', 'DB_PORT'
];

console.log('Relevant environment variables:');
relevantEnvVars.forEach(varName => {
  console.log(`${varName}:`, process.env[varName] ? '[SET]' : '[NOT SET]');
});

const config = {
  superuser: {
    username: process.env.DB_SUPERUSER_USERNAME,
    password: process.env.DB_SUPERUSER_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  development: {
    username: process.env.DB_SUPERUSER_USERNAME,
    password: process.env.DB_SUPERUSER_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    username: process.env.DB_APP_USERNAME,
    password: process.env.DB_APP_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_APP_USERNAME,
    password: process.env.DB_APP_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres'
  }
};

console.log('Development config:', JSON.stringify(config.development, null, 2));

module.exports = config;