/**
 * Script to extract test failures from the test results file
 * Creates individual failure files and a summary with detailed error messages
 */
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_RESULTS_FILE = path.join(__dirname, '..', 'test-output', 'test-results.txt');
const FAILURES_DIR = path.join(__dirname, '..', 'test-output', 'failures');
const SUMMARY_FILE = path.join(FAILURES_DIR, 'summary.md');
const DETAIL_DIR = path.join(FAILURES_DIR, 'details');

// Ensure directories exist
if (!fs.existsSync(FAILURES_DIR)) {
  fs.mkdirSync(FAILURES_DIR, { recursive: true });
}

if (!fs.existsSync(DETAIL_DIR)) {
  fs.mkdirSync(DETAIL_DIR, { recursive: true });
} else {
  // Clean previous files
  fs.readdirSync(DETAIL_DIR).forEach(file => {
    fs.unlinkSync(path.join(DETAIL_DIR, file));
  });
}

// Remove previous summary and error files
['summary.md', 'errors.json', 'errors.md'].forEach(file => {
  const filePath = path.join(FAILURES_DIR, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
});

// Get current timestamp for filenames
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Read test results file
try {
  const content = fs.readFileSync(TEST_RESULTS_FILE, 'utf8');
  const lines = content.split('\n');

  // Parse test results to find failures
  let failures = [];
  let currentFailure = null;
  let collectingFailure = false;
  let errorContent = [];
  let inErrorBlock = false;
  let errorIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Jest error blocks and keep collecting
    if (line.includes('Error: ') || line.includes('TypeError: ') || line.includes('ReferenceError: ')) {
      inErrorBlock = true;
      errorContent = [line];
      continue;
    }

    if (inErrorBlock) {
      errorContent.push(line);
      
      // End of error block usually has indentation reset or empty line
      if (line.trim() === '' || (!line.startsWith('    ') && errorContent.length > 1)) {
        // Save this error block
        fs.writeFileSync(
          path.join(DETAIL_DIR, `error-${timestamp}-${errorIndex++}.txt`),
          errorContent.join('\n')
        );
        inErrorBlock = false;
      }
    }

    // Start of a failing test
    if (line.includes('● ') && !collectingFailure) {
      const testName = line.replace('● ', '').trim();
      currentFailure = { 
        testName, 
        content: [line],
        file: null,
        errorType: null,
        errorMessage: null
      };
      collectingFailure = true;
      continue;
    }

    // If we're collecting a failure, add the line
    if (collectingFailure) {
      currentFailure.content.push(line);

      // Look for the file path in stack trace
      if (line.includes('at ') && line.includes('.js:') && !currentFailure.file) {
        const match = line.match(/\s*at\s+.*\s+\((.*\.js):\d+:\d+\)/);
        if (match && match[1]) {
          currentFailure.file = match[1].trim();
        }
      }

      // Capture error type and message
      if (!currentFailure.errorType) {
        if (line.includes('TypeError: ')) {
          currentFailure.errorType = 'TypeError';
          currentFailure.errorMessage = line.trim();
        } else if (line.includes('ReferenceError: ')) {
          currentFailure.errorType = 'ReferenceError';
          currentFailure.errorMessage = line.trim();
        } else if (line.includes('Error: ')) {
          currentFailure.errorType = 'Error';
          currentFailure.errorMessage = line.trim();
        } else if (line.includes('AssertionError: ')) {
          currentFailure.errorType = 'AssertionError';
          currentFailure.errorMessage = line.trim();
        } else if (line.includes('expect(')) {
          currentFailure.errorType = 'AssertionError';
          currentFailure.errorMessage = line.trim();
        }
      }

      // End of a failing test (blank line after stack trace or new failure)
      if (line.trim() === '' || (i < lines.length - 1 && lines[i + 1].includes('● '))) {
        failures.push(currentFailure);
        collectingFailure = false;
      }
    }
  }

  console.log(`Found ${failures.length} test failures`);

  // Group failures by file
  const fileGroups = {};
  const errorTypes = {};
  
  failures.forEach(failure => {
    const file = failure.file || 'unknown';
    if (!fileGroups[file]) {
      fileGroups[file] = [];
    }
    fileGroups[file].push(failure);
    
    // Track error types for analysis
    const errorType = failure.errorType || 'unknown';
    if (!errorTypes[errorType]) {
      errorTypes[errorType] = [];
    }
    errorTypes[errorType].push(failure);
  });

  // Write failures to individual files and create summary
  let summaryContent = `# Test Failure Summary\n\n`;
  summaryContent += `Generated: ${new Date().toISOString()}\n\n`;
  summaryContent += `Total failures: ${failures.length}\n\n`;

  // Add error type summary
  summaryContent += `## Error Types\n\n`;
  Object.keys(errorTypes).sort().forEach(errorType => {
    const count = errorTypes[errorType].length;
    summaryContent += `- **${errorType}**: ${count} failures (${Math.round(count * 100 / failures.length)}%)\n`;
  });
  
  // Add a table of contents by file
  summaryContent += `\n## Files with Failures\n\n`;
  Object.keys(fileGroups).sort().forEach(file => {
    const count = fileGroups[file].length;
    const fileId = file.replace(/[\/\\:.]/g, '-');
    summaryContent += `- [${file} (${count} failures)](#${fileId})\n`;
  });

  // Create detailed error analysis
  let errorsContent = `# Detailed Error Analysis\n\n`;
  errorsContent += `Generated: ${new Date().toISOString()}\n\n`;
  
  // Group by error message to find patterns
  const errorMessages = {};
  failures.forEach(failure => {
    if (!failure.errorMessage) return;
    
    const message = failure.errorMessage;
    if (!errorMessages[message]) {
      errorMessages[message] = [];
    }
    errorMessages[message].push(failure);
  });
  
  // Add error message patterns
  errorsContent += `## Common Error Patterns\n\n`;
  Object.keys(errorMessages)
    .sort((a, b) => errorMessages[b].length - errorMessages[a].length)
    .slice(0, 10)  // Top 10 most common errors
    .forEach(message => {
      const count = errorMessages[message].length;
      errorsContent += `### Error occurs ${count} times:\n\`\`\`\n${message}\n\`\`\`\n\nAffected tests:\n`;
      
      errorMessages[message].slice(0, 5).forEach(failure => {
        errorsContent += `- ${failure.testName}\n`;
      });
      
      if (errorMessages[message].length > 5) {
        errorsContent += `- ... and ${errorMessages[message].length - 5} more\n`;
      }
      
      errorsContent += '\n';
    });

  // Add detailed sections for each file
  Object.keys(fileGroups).sort().forEach(file => {
    const fileId = file.replace(/[\/\\:.]/g, '-');
    const fileName = path.basename(file);
    const outputFile = path.join(DETAIL_DIR, `${timestamp}-${fileName}.txt`);
    
    let fileContent = `FAILURES IN ${file}\n\n`;
    let fileSummary = `\n\n## ${file} {#${fileId}}\n\n`;
    
    fileGroups[file].forEach(failure => {
      fileContent += failure.content.join('\n') + '\n\n';
      
      // Add error type and message to summary if available
      if (failure.errorType && failure.errorMessage) {
        fileSummary += `- ${failure.testName}\n  - *${failure.errorType}*: \`${failure.errorMessage.substring(0, 100)}${failure.errorMessage.length > 100 ? '...' : ''}\`\n`;
      } else {
        fileSummary += `- ${failure.testName}\n`;
      }
    });
    
    // Write file-specific failures
    fs.writeFileSync(outputFile, fileContent);
    summaryContent += fileSummary;
  });
  
  // Write summary and error analysis files
  fs.writeFileSync(SUMMARY_FILE, summaryContent);
  fs.writeFileSync(path.join(FAILURES_DIR, 'errors.md'), errorsContent);
  
  // Create a JSON file with all errors for programmatic analysis
  fs.writeFileSync(
    path.join(FAILURES_DIR, 'errors.json'), 
    JSON.stringify({ 
      failures, 
      byFile: fileGroups, 
      byErrorType: errorTypes,
      byErrorMessage: errorMessages
    }, null, 2)
  );
  
  console.log(`Failures extracted to: ${FAILURES_DIR}`);
  console.log(`Summary written to: ${SUMMARY_FILE}`);
  console.log(`Detailed error analysis: ${path.join(FAILURES_DIR, 'errors.md')}`);
  console.log(`Error data (JSON): ${path.join(FAILURES_DIR, 'errors.json')}`);

} catch (error) {
  console.error('Error processing test results:', error);
  process.exit(1);
}