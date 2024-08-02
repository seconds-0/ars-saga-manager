const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'documentation', 'file_structure.txt');
const ignoredDirs = ['react', 'node_modules', '.git'];

let debounceTimer;
let lastUpdateTime = 0;
const debounceDelay = 5000; // 5 seconds
const minUpdateInterval = 30000; // 30 seconds

function generateFileStructure() {
  const structure = [];

  function traverseDirectory(dir, depth = 0) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const relativePath = path.relative(projectRoot, filePath);

      if (stats.isDirectory()) {
        if (!ignoredDirs.includes(file)) {
          structure.push(`${'  '.repeat(depth)}${file}/`);
          traverseDirectory(filePath, depth + 1);
        }
      } else {
        structure.push(`${'  '.repeat(depth)}${file}`);
      }
    });
  }

  traverseDirectory(projectRoot);
  return structure.join('\n');
}

function updateFileStructure() {
  const now = Date.now();
  if (now - lastUpdateTime < minUpdateInterval) {
    console.log('Update skipped: Too soon since last update');
    return;
  }

  const timestamp = new Date().toISOString();
  const fileContent = `Last updated: ${timestamp}\n\n${generateFileStructure()}`;

  fs.writeFileSync(outputFile, fileContent);
  console.log('File structure updated:', outputFile);
  lastUpdateTime = now;
}

// Run on startup
updateFileStructure();

// Watch for file changes
const watcher = chokidar.watch(projectRoot, {
  ignored: [
    /(^|[\/\\])\../, // Ignore dot files
    /node_modules/,
    /react/,
    /.git/
  ],
  persistent: true
});

watcher.on('all', (event, path) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateFileStructure();
  }, debounceDelay);
});

console.log('Watching for file changes...');