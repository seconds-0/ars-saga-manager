const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting development environment setup...');

try {
  // Check if Docker is running
  try {
    execSync('docker info', { stdio: 'ignore' });
    console.log('✅ Docker is running');
  } catch (error) {
    console.error('❌ Docker is not running. Please start Docker Desktop first.');
    process.exit(1);
  }

  // Check for .env file
  const envPath = path.join(__dirname, '../backend/.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from example...');
    fs.copyFileSync(
      path.join(__dirname, '../backend/.env.example'),
      envPath
    );
    console.log('✅ Created .env file. Please update it with your settings.');
  }

  // Create necessary directories
  const dirs = [
    '../backend/logs',
    '../grafana/provisioning/dashboards',
    '../grafana/provisioning/datasources'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });

  // Start the logging stack
  console.log('🚀 Starting logging stack...');
  execSync('docker-compose up -d', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

  console.log('\n🎉 Development environment setup complete!');
  console.log('\nNext steps:');
  console.log('1. Update backend/.env with your database credentials');
  console.log('2. Run `cd backend && npm run dev` to start the backend');
  console.log('3. Run `cd frontend && npm start` to start the frontend');
  console.log('4. Visit http://localhost:3200 to view the logging dashboard');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
} 