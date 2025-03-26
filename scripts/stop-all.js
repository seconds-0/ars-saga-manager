const { execSync } = require('child_process');
const path = require('path');
const net = require('net');

console.log('👋 Stopping all services...');

// Helper function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Helper function to run a command and handle errors
function runCommand(command, options = {}) {
  try {
    execSync(command, { 
      stdio: 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      console.error(`❌ Error running command: ${command}`);
      console.error(error.message);
    }
    return false;
  }
}

// Helper function to wait until port is free
async function waitForPortToBeFree(port, retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    if (!await isPortInUse(port)) {
      return true;
    }
    if (i < retries - 1) {
      console.log(`Waiting for port ${port} to be freed... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
}

// Helper function to check if Docker container is running
function isDockerContainerRunning(containerName) {
  try {
    const result = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
    return result.includes(containerName);
  } catch (error) {
    return false;
  }
}

// Helper function for aggressive Docker cleanup
function cleanupDocker() {
  console.log('\n📊 Stopping logging stack...');
  
  // First try normal docker-compose down
  runCommand('docker-compose -f docker/docker-compose.yml down', { 
    cwd: path.join(__dirname, '..'),
    ignoreError: true
  });

  // Force remove any remaining containers
  console.log('Checking for remaining containers...');
  try {
    const containers = execSync('docker ps -q -f name=ars-saga-manager', { encoding: 'utf8' });
    if (containers.trim()) {
      console.log('Found remaining containers, forcing removal...');
      runCommand('docker rm -f $(docker ps -q -f name=ars-saga-manager)', { ignoreError: true });
    }
  } catch (error) {
    // Ignore errors
  }

  // Remove volumes
  console.log('Removing Docker volumes...');
  runCommand('docker-compose -f docker/docker-compose.yml down -v', {
    cwd: path.join(__dirname, '..'),
    ignoreError: true
  });
}

// Helper function to kill process on a port
async function killPort(port, name) {
  console.log(`\nAttempting to stop ${name} on port ${port}...`);
  
  // For React's development server on port 3000, try multiple approaches
  if (port === 3000) {
    // First try to kill any node processes running the dev server
    runCommand('taskkill /F /IM node.exe /FI "WINDOWTITLE eq react-scripts*"', { ignoreError: true });
    runCommand('taskkill /F /IM node.exe /FI "WINDOWTITLE eq react-scripts serve*"', { ignoreError: true });
  }
  
  // Try normal kill first
  runCommand(`npx kill-port ${port}`, { ignoreError: true });
  
  // Wait a bit and check if port is freed
  if (await waitForPortToBeFree(port, 2, 1000)) {
    console.log(`✅ Successfully stopped ${name} (port ${port})`);
    return true;
  }

  // If still not freed, try with elevated privileges on Windows
  console.log(`Attempting to stop ${name} with elevated privileges...`);
  try {
    // Find PID using port
    const findPid = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pid = findPid.toString().match(/\s+(\d+)\s*$/m)?.[1];
    
    if (pid) {
      // Try to kill with taskkill (requires admin privileges)
      runCommand(`taskkill /F /PID ${pid}`, { ignoreError: true });
      
      if (await waitForPortToBeFree(port, 3, 1000)) {
        console.log(`✅ Successfully stopped ${name} with elevated privileges`);
        return true;
      }
    }
  } catch (error) {
    // Ignore errors from netstat/taskkill
  }

  // For React's development server, try one last approach
  if (port === 3000) {
    try {
      // Try to find any node processes serving on port 3000
      const findNodePid = execSync('netstat -ano | findstr ":3000.*LISTENING"', { encoding: 'utf8' });
      const nodePid = findNodePid.toString().match(/\s+(\d+)\s*$/m)?.[1];
      
      if (nodePid) {
        console.log('Found node process on port 3000, attempting force kill...');
        runCommand(`taskkill /F /PID ${nodePid}`, { ignoreError: true });
        
        if (await waitForPortToBeFree(port, 2, 1000)) {
          console.log(`✅ Successfully stopped React development server`);
          return true;
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
  
  return false;
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

async function main() {
  try {
    // Check for Windows Grafana service first
    const grafanaServiceRunning = checkGrafanaWindowsService();
    if (grafanaServiceRunning) {
      console.log('\n❌ Cannot proceed while Grafana Windows Service is running');
      console.log('Please stop it and try again.');
      process.exit(1);
    }

    // Stop frontend
    if (await isPortInUse(3000)) {
      await killPort(3000, 'Frontend');
    }

    // Stop backend
    if (await isPortInUse(3001)) {
      await killPort(3001, 'Backend');
    }

    // Aggressive Docker cleanup
    cleanupDocker();

    // Give Docker a moment to release ports
    console.log('Waiting for ports to be released...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Final verification
    const portsToCheck = [
      { port: 3000, name: 'Frontend' },
      { port: 3001, name: 'Backend' },
      { port: 3100, name: 'Loki' },
      { port: 3200, name: 'Grafana' }
    ];

    // Check Docker containers first
    const containerNames = ['grafana', 'loki', 'promtail'].map(name => `ars-saga-manager-${name}-1`);
    for (const container of containerNames) {
      if (isDockerContainerRunning(container)) {
        console.error(`❌ Docker container ${container} is still running`);
        console.log('Attempting force removal...');
        runCommand(`docker rm -f ${container}`, { ignoreError: true });
      }
    }

    let allPortsFree = true;
    for (const { port, name } of portsToCheck) {
      if (await isPortInUse(port)) {
        console.error(`❌ Port ${port} (${name}) is still in use`);
        allPortsFree = false;
      }
    }

    if (allPortsFree) {
      console.log('\n✅ All services stopped successfully!');
    } else {
      console.log('\n⚠️ Some services may still be running.');
      console.log('Since Cursor cannot run commands as Administrator, please:');
      console.log('1. Open PowerShell as Administrator (Windows + X, then select "Windows PowerShell (Admin)")');
      console.log(`2. Navigate to: ${path.resolve(__dirname, '..')}`);
      console.log('3. Run these commands:');
      console.log('\nFirst, stop any remaining Docker containers:');
      console.log('   docker rm -f $(docker ps -q -f name=ars-saga-manager)');
      for (const { port, name } of portsToCheck) {
        if (await isPortInUse(port)) {
          console.log(`\nFor ${name} (port ${port}):`);
          console.log(`   netstat -ano | findstr :${port}`);
          console.log('   taskkill /F /PID <PID from previous command>');
        }
      }
      console.log('\nThen return to Cursor and try npm run start:all again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error stopping services:', error);
    process.exit(1);
  }
}

main(); 