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

    const htmlContent = template({
      pageTitle: this._options.pageTitle,
      results: results,
    });

    fs.writeFileSync(outputPath, htmlContent);
    console.log(`HTML report generated at: ${outputPath}`);
  }
}

module.exports = CustomHtmlReporter;