const { spawn, exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

console.log('🔄 Restarting all services...');

/**
 * Checks if a port is in use by attempting to create a server on it
 * @param {number} port - Port to check
 * @returns {Promise<boolean>} - True if port is in use, false otherwise
 */
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

/**
 * Waits until a port is free
 * @param {number} port - Port to check
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<boolean>} - True if port is free, false if still in use after retries
 */
async function waitForPortToBeFree(port, retries = 10, delay = 1000) {
  console.log(`Checking if port ${port} is free...`);
  for (let i = 0; i < retries; i++) {
    if (!await isPortInUse(port)) {
      console.log(`Port ${port} is free.`);
      return true;
    }
    if (i < retries - 1) {
      console.log(`Waiting for port ${port} to be freed... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.log(`Port ${port} is still in use after ${retries} retries.`);
  return false;
}

/**
 * Checks if Docker containers related to the project are running
 * @returns {Promise<boolean>} - True if any project containers are running
 */
async function areDockerContainersRunning() {
  return new Promise((resolve) => {
    exec('docker ps --format "{{.Names}}" | grep ars-saga-manager', (error, stdout) => {
      if (error) {
        // If error, likely no containers running
        resolve(false);
        return;
      }
      resolve(stdout.trim().length > 0);
    });
  });
}

/**
 * Waits for all Docker containers to stop
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<boolean>} - True if all containers stopped, false otherwise
 */
async function waitForDockerContainersToStop(retries = 10, delay = 1000) {
  console.log('Checking if Docker containers are stopped...');
  for (let i = 0; i < retries; i++) {
    if (!await areDockerContainersRunning()) {
      console.log('All Docker containers are stopped.');
      return true;
    }
    if (i < retries - 1) {
      console.log(`Waiting for Docker containers to stop... (${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.log('Docker containers are still running after multiple checks.');
  return false;
}

/**
 * Executes a command and returns a promise
 * @param {string} command - The command to execute
 * @param {object} options - Options for exec
 * @returns {Promise<{stdout: string, stderr: string}>} - Command output
 */
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Executing: ${command}`);
    
    const childProcess = exec(command, { 
      ...options, 
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large outputs
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      // Pass through to console in real-time
      process.stdout.write(output);
    });

    childProcess.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      // Pass through to console in real-time
      process.stderr.write(output);
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Command exited with code ${code}`);
        reject(new Error(`Command failed with exit code ${code}`));
        return;
      }
      
      resolve({ stdout, stderr });
    });

    childProcess.on('error', (error) => {
      console.error(`❌ Error executing ${command}:`, error.message);
      reject(error);
    });
  });
}

/**
 * Spawns a child process detached from the parent
 * @param {string} command - Command to run
 * @param {Array<string>} args - Command arguments
 * @param {object} options - Spawn options
 * @returns {Promise<object>} - The spawned process
 */
function spawnDetached(command, args, options = {}) {
  console.log(`🚀 Spawning: ${command} ${args.join(' ')}`);
  
  const child = spawn(command, args, {
    ...options,
    detached: true,
    stdio: 'ignore'
  });
  
  child.unref();
  
  return child;
}

/**
 * Executes a script from the package.json with real-time logging
 * @param {string} scriptName - Name of the script in package.json
 * @returns {Promise<void>}
 */
async function runNpmScript(scriptName) {
  const rootDir = path.join(__dirname, '..');
  
  try {
    console.log(`\n🚀 Running npm script: ${scriptName}`);
    
    // Get the actual script command from package.json
    const packageJsonContent = fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    const scriptCommand = packageJson.scripts[scriptName];
    
    console.log(`Script command: ${scriptCommand}`);
    
    await execCommand(`npm run ${scriptName}`, { 
      cwd: rootDir
    });
    
    console.log(`✅ Successfully completed: ${scriptName}`);
  } catch (error) {
    console.error(`❌ Failed to run ${scriptName}:`, error.message);
    throw error;
  }
}

/**
 * Main function to restart all services
 */
async function restartAllServices() {
  try {
    // Verify script paths exist
    const stopScriptPath = path.join(__dirname, 'stop-all.js');
    const startScriptPath = path.join(__dirname, 'start-all.js');
    
    if (!fs.existsSync(stopScriptPath)) {
      throw new Error(`Stop script not found at ${stopScriptPath}`);
    }
    
    if (!fs.existsSync(startScriptPath)) {
      throw new Error(`Start script not found at ${startScriptPath}`);
    }
    
    // Step 1: Stop all services
    console.log('\n👋 Stopping all services...');
    await runNpmScript('stop:all');
    
    // Step 2: Wait for services to fully stop
    console.log('\n⏳ Waiting for all services to completely stop...');
    
    const portsToCheck = [3000, 3001, 3100, 3200]; // Frontend, Backend, Loki, Grafana
    
    // Wait for all ports to be freed
    for (const port of portsToCheck) {
      await waitForPortToBeFree(port);
    }
    
    // Wait for Docker containers to stop
    await waitForDockerContainersToStop();
    
    // Extra pause to ensure everything has settled
    console.log('All services appear to be stopped. Waiting an additional 2 seconds before starting...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Start all services
    console.log('\n🚀 Starting all services...');
    await runNpmScript('start:all');
    
    console.log('\n✅ Restart complete!');
    console.log('🔍 Services should now be initializing. Check the console for status updates.');
    console.log('⏳ It may take a minute for all services to become fully operational.');
    
  } catch (error) {
    console.error('\n❌ Failed to restart services:', error.message);
    process.exit(1);
  }
}

// Run the restart function
restartAllServices();