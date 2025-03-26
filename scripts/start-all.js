const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');

console.log('🚀 Starting all services...');

// Helper function to check if a service is responding correctly
async function isServiceHealthy(url, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Helper function to ensure kill-port is installed
function ensureKillPortInstalled() {
  try {
    require('kill-port');
  } catch (error) {
    console.log('📦 Installing kill-port package...');
    execSync('npm install kill-port', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
  }
}

// Helper function to check if Docker is running
function isDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Helper function to check if Windows Grafana service exists and is running
function checkGrafanaWindowsService() {
  try {
    const serviceCheck = execSync('sc query Grafana', { encoding: 'utf8' });
    if (serviceCheck.includes('RUNNING')) {
      console.log('\n⚠️ Grafana Windows Service detected and running!');
      console.log('This may conflict with our Docker setup.');
      console.log('Please stop it using one of these methods:');
      console.log('1. Run as Administrator: Stop-Service Grafana');
      console.log('2. Or use Windows Services (services.msc) to stop Grafana');
      return true;
    }
    return false;
  } catch (error) {
    // Service doesn't exist
    return false;
  }
}

// Helper function to check Docker containers
async function checkDockerServices() {
  const services = {
    grafana: { url: 'http://localhost:3200', running: false },
    loki: { url: 'http://localhost:3100', running: false }
  };

  // Check if containers are running and responding
  for (const [name, service] of Object.entries(services)) {
    service.running = await isServiceHealthy(service.url);
    if (service.running) {
      console.log(`✅ ${name} is already running and healthy`);
    }
  }

  return services;
}

async function main() {
  try {
    // Ensure kill-port is installed
    ensureKillPortInstalled();

    // Check prerequisites
    console.log('\n🔍 Checking prerequisites...');

    // Check for Windows Grafana service first
    const grafanaServiceRunning = checkGrafanaWindowsService();
    if (grafanaServiceRunning) {
      console.log('\n❌ Cannot proceed while Grafana Windows Service is running');
      console.log('Please stop it and try again.');
      process.exit(1);
    }

    // Check Docker
    if (!isDockerRunning()) {
      console.error('❌ Docker is not running. Please start Docker Desktop first.');
      process.exit(1);
    }

    // Check existing services
    console.log('\n🔍 Checking existing services...');
    
    // Check frontend
    const frontendRunning = await isServiceHealthy('http://localhost:3000');
    if (frontendRunning) {
      console.log('✅ Frontend is already running and healthy');
    }

    // Check backend
    const backendRunning = await isServiceHealthy('http://localhost:3001');
    if (backendRunning) {
      console.log('✅ Backend is already running and healthy');
    }

    // Check Docker services
    const dockerServices = await checkDockerServices();
    const allDockerServicesRunning = Object.values(dockerServices).every(s => s.running);

    // Helper function to spawn a process with inherited stdio
    function spawnProcess(command, args, options) {
      const proc = spawn(command, args, {
        ...options,
        stdio: 'inherit',
        shell: true
      });

      proc.on('error', (error) => {
        console.error(`❌ Error starting ${options.name}:`, error.message);
      });

      return proc;
    }

    // Start or restart Docker services if needed
    if (!allDockerServicesRunning) {
      console.log('\n📊 Starting logging stack...');
      try {
        execSync('docker-compose -f docker/docker-compose.yml down', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      } catch (error) {
        // Ignore errors here as containers might not exist
      }

      spawnProcess('docker-compose', ['-f', 'docker/docker-compose.yml', 'up', '-d'], { 
        name: 'logging-stack',
        cwd: path.join(__dirname, '..')
      });
    }

    // Give the logging stack a moment to start if it was restarted
    setTimeout(() => {
      // Start backend if not running
      if (!backendRunning) {
        console.log('\n🔧 Starting backend server...');
        spawnProcess('npm', ['run', 'dev'], {
          name: 'backend',
          cwd: path.join(__dirname, '../backend')
        });
      }

      // Start frontend if not running
      if (!frontendRunning) {
        console.log('\n🎨 Starting frontend server...');
        spawnProcess('npm', ['start'], {
          name: 'frontend',
          cwd: path.join(__dirname, '../frontend')
        });
      }

      // Run health check after a delay to allow services to start
      setTimeout(async () => {
        console.log('\n🔍 Running final health check...');
        try {
          const healthCheck = require('./health-check');
          await healthCheck();
          
          console.log('\n📝 Note: Some services may report timeouts while still initializing.');
          console.log('This is normal, especially for Loki and Grafana services.');
          console.log('If all services report "All required services are running!" at the end, everything is fine.');
        } catch (error) {
          console.log('Health check encountered non-fatal errors - services may still be starting up');
        }
      }, 15000);
    }, !allDockerServicesRunning ? 2000 : 0);

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down all services...');
      spawn('docker-compose', ['-f', 'docker/docker-compose.yml', 'down'], {
        stdio: 'inherit',
        shell: true,
        cwd: path.join(__dirname, '..')
      });
      process.exit();
    });
  } catch (error) {
    console.error('❌ Error starting services:', error.message);
    process.exit(1);
  }
}

main(); 