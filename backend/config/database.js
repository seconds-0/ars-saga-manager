const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env');
console.log('Attempting to load .env from:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

const result = require('dotenv').config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Full process.env:', process.env);

console.log('Environment variables:');
console.log('DB_SUPERUSER_USERNAME:', process.env.DB_SUPERUSER_USERNAME);
console.log('DB_SUPERUSER_PASSWORD:', process.env.DB_SUPERUSER_PASSWORD);
console.log('DB_DEV_USERNAME:', process.env.DB_DEV_USERNAME);
console.log('DB_DEV_PASSWORD:', process.env.DB_DEV_PASSWORD);
console.log('DB_APP_USERNAME:', process.env.DB_APP_USERNAME);
console.log('DB_APP_PASSWORD:', process.env.DB_APP_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

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