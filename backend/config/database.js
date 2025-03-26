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

// Special handling for WSL connection to Windows PostgreSQL
const getHostForEnvironment = () => {
  // When running in WSL, we may need a special hostname to connect to Windows
  if (process.env.WSL_DISTRO_NAME) {
    console.log('Running in WSL environment, using special host configuration');
    // Try one of these IPs for connecting from WSL to Windows
    return process.env.WINDOWS_HOST_IP || '172.17.0.1';
  }
  return process.env.DB_HOST || 'localhost';
};

const config = {
  superuser: {
    username: process.env.DB_SUPERUSER_USERNAME || 'postgres',
    password: process.env.DB_SUPERUSER_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ars_saga_manager',
    host: getHostForEnvironment(),
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres'
  },
  development: {
    username: process.env.DB_SUPERUSER_USERNAME || 'postgres',
    password: process.env.DB_SUPERUSER_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ars_saga_manager',
    host: getHostForEnvironment(),
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    username: process.env.DB_APP_USERNAME || 'postgres',
    password: process.env.DB_APP_PASSWORD || 'password',
    database: process.env.DB_NAME || 'ars_saga_manager',
    host: getHostForEnvironment(),
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres'
  },
  production: {
    username: process.env.DB_APP_USERNAME || 'postgres',
    password: process.env.DB_APP_PASSWORD || 'password', 
    database: process.env.DB_NAME || 'ars_saga_manager',
    host: getHostForEnvironment(),
    port: process.env.DB_PORT || '5432',
    dialect: 'postgres'
  }
};

console.log('Development config:', JSON.stringify(config.development, null, 2));

module.exports = config;