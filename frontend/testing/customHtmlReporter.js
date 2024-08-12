const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

class CustomHtmlReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
  }

  onRunComplete(contexts, results) {
    const templatePath = this._options.template;
    const outputPath = this._options.outputPath;
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);

    const testSuites = results.testResults.map(testFile => ({
      name: path.relative(this._globalConfig.rootDir, testFile.testFilePath),
      tests: testFile.testResults.map(test => ({
        name: test.fullName,
        status: test.status,
        duration: test.duration,
        failureMessages: test.failureMessages
      }))
    }));

    const htmlContent = template({
      pageTitle: this._options.pageTitle,
      testSuites: testSuites,
    });

    fs.writeFileSync(outputPath, htmlContent);
    console.log(`HTML report generated at: ${outputPath}`);
  }
}

module.exports = CustomHtmlReporter;