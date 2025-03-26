const http = require('http');
const { execSync } = require('child_process');

const services = [
  { name: 'Frontend', url: 'http://localhost:3000', optional: false },
  { name: 'Backend', url: 'http://localhost:3001', optional: false },
  { name: 'Grafana', url: 'http://localhost:3200', optional: true },
  { name: 'Loki', url: 'http://localhost:3100', optional: true }
];

async function checkService(service) {
  return new Promise((resolve) => {
    const req = http.get(service.url, (res) => {
      const status = res.statusCode;
      console.log(`${service.name}: ${status === 200 ? '✅' : '⚠️'} (${status})`);
      resolve(status === 200);
    });

    req.on('error', () => {
      console.log(`${service.name}: ❌ (Not running)`);
      resolve(false);
    });

    // Set a timeout to avoid hanging
    req.setTimeout(8000, () => {
      req.destroy();
      const msg = service.optional ? 
        `${service.name}: ❌ (Timeout - optional service still starting)` :
        `${service.name}: ❌ (Timeout - may still be initializing)`;
      console.log(msg);
      resolve(false);
    });
  });
}

async function checkDocker() {
  try {
    execSync('docker ps', { stdio: 'ignore' });
    console.log('Docker: ✅');
    return true;
  } catch (error) {
    console.log('Docker: ❌ (Not running)');
    return false;
  }
}

async function main() {
  try {
    console.log('🔍 Checking service health...\n');

    const dockerRunning = await checkDocker();
    console.log(''); // Empty line for readability

    const results = await Promise.all(services.map(checkService));
    
    console.log('\nSummary:');
    const failed = services.filter((service, i) => !results[i] && !service.optional);
    const optional = services.filter((service, i) => !results[i] && service.optional);
    
    if (failed.length === 0) {
      console.log('✅ All required services are running!');
      
      if (optional.length > 0) {
        console.log('\nℹ️ Optional services still initializing:');
        optional.forEach(service => {
          console.log(`   - ${service.name} (${service.url}) - May still be starting up`);
        });
        console.log('\nThis is normal during startup and won\'t affect core functionality.');
      }
    } else {
      console.log('❌ Some required services are not running:');
      failed.forEach(service => {
        console.log(`   - ${service.name} (${service.url})`);
      });
      
      console.log('\nTroubleshooting tips:');
      console.log('1. Services often need more time to initialize - try waiting 30 seconds more');
      console.log('2. Check if all required services are started');
      console.log('3. Verify no other applications are using the required ports');
      console.log('4. Check the logs for each service');
      console.log('\nUseful commands:');
      console.log('- Backend logs: cd backend && npm run dev');
      console.log('- Frontend logs: cd frontend && npm start');
      console.log('- Docker logs: docker-compose logs -f');
    }
  } catch (error) {
    console.error('Error during health check:', error);
    process.exit(1);
  }
}

// Only run main if this script is run directly
if (require.main === module) {
  main().catch(console.error);
} else {
  // Export for use as a module
  module.exports = main;
} 