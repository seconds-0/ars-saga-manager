const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class CustomTestResultsProcessor {
  constructor() {
    this.results = {};
  }

  processResults(testResults) {
    testResults.testResults.forEach(testFile => {
      const fileName = path.basename(testFile.testFilePath);
      this.results[fileName] = {
        name: fileName,
        tests: testFile.testResults.map(test => ({
          name: test.fullName,
          status: test.status,
          duration: test.duration,
          failureMessages: test.failureMessages
        }))
      };
    });

    this.generateHtmlReport();
    return testResults;
  }

  generateHtmlReport() {
    const templatePath = path.resolve(__dirname, './customTemplate.html');
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);

    const htmlContent = template({ testSuites: Object.values(this.results) });
    const outputPath = path.resolve(__dirname, '../test-report.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(`HTML report generated at: ${outputPath}`);
  }
}

module.exports = testResults => {
  const processor = new CustomTestResultsProcessor();
  return processor.processResults(testResults);
};