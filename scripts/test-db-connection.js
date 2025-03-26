/**
 * A simple script to test database connection from WSL to Windows PostgreSQL
 */

require('dotenv').config({ path: '../backend/.env' });
const { Client } = require('pg');

// Get Windows host IP - for WSL, use the special hostname
const host = '172.17.0.1'; // This IP often works for WSL → Windows connection
// Alternative: You could also try process.env.WSL_HOST_IP or 'host.docker.internal'

const client = new Client({
  user: process.env.DB_SUPERUSER_USERNAME || 'postgres',
  password: process.env.DB_SUPERUSER_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ars_saga_manager',
  host: host,
  port: process.env.DB_PORT || 5432,
});

console.log('Attempting to connect to Windows PostgreSQL from WSL...');
console.log(`Host: ${host}`);
console.log(`Port: ${process.env.DB_PORT || 5432}`);
console.log(`Database: ${process.env.DB_NAME || 'ars_saga_manager'}`);
console.log(`User: ${process.env.DB_SUPERUSER_USERNAME || 'postgres'}`);

client.connect()
  .then(() => {
    console.log('✅ Connection successful!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('PostgreSQL version:', res.rows[0].version);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err);
  })
  .finally(() => {
    console.log('Test complete');
    
    console.log('\nTroubleshooting tips:');
    console.log('1. Check if PostgreSQL is running in Windows');
    console.log('2. Ensure PostgreSQL is configured to accept connections (pg_hba.conf)');
    console.log('3. Try different IP addresses: 172.17.0.1, host.docker.internal, or local.host');
    console.log('4. Check Windows firewall settings');
    console.log('5. Verify port 5432 is open and PostgreSQL is listening on all interfaces');
  });