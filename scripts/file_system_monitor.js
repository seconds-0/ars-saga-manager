const fs = require('fs');
const path = require('path');
const { watch } = require('chokidar');

const projectRoot = path.resolve(__dirname, '..');
const outputFile = path.join(projectRoot, 'Documentation', 'file_system_structure.txt');

let updateTimeout = null;
const debounceTime = 5000; // 5 seconds

function debounce(func, delay) {
  return function() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(func, delay);
  }
}

function updateFileSystemStructure() {
  let content = `ARS-SAGA-MANAGER File System Structure\n`;
  content += `Last updated: ${new Date().toISOString()}\n\n`;

  function traverseDirectory(dir, depth = 0) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      // Skip node_modules, .git folders, and .gitignore file
      if (file === 'node_modules' || file === '.git' || file === '.gitignore') return;

      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const indent = '  '.repeat(depth);
      
      if (stats.isDirectory()) {
        content += `${indent}${file}/\n`;
        traverseDirectory(filePath, depth + 1);
      } else {
        content += `${indent}${file}\n`;
      }
    });
  }

  traverseDirectory(projectRoot);
  fs.writeFileSync(outputFile, content);
  console.log(`File system structure updated at ${outputFile}`);
}

const debouncedUpdate = debounce(updateFileSystemStructure, debounceTime);

const watcher = watch(projectRoot, {
  ignored: [
    /(^|[\/\\])\../, // Ignore dotfiles
    '**/node_modules/**', // Ignore all node_modules folders
    '**/build/**', // Ignore build folders
    '**/dist/**', // Ignore dist folders
    '**/.git/**', // Ignore .git folder
    '.gitignore', // Ignore .gitignore file
  ],
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

watcher
  .on('add', debouncedUpdate)
  .on('change', debouncedUpdate)
  .on('unlink', debouncedUpdate)
  .on('addDir', debouncedUpdate)
  .on('unlinkDir', debouncedUpdate);

console.log(`Watching for file system changes in ${projectRoot}`);

// Initial update
updateFileSystemStructure();

process.on('SIGINT', () => {
  watcher.close();
  console.log('File system watcher closed');
  process.exit(0);
});