const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  reporters: [
    "default",
    [path.resolve(__dirname, "./customHtmlReporter.js"), {
      "pageTitle": "Test Report",
      "outputPath": path.resolve(__dirname, "../test-report.html"),
      "includeFailureMsg": true,
      "template": path.resolve(__dirname, "./customTemplate.html")
    }]
  ],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  transformIgnorePatterns: ["node_modules/(?!axios)/"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/testing/fileMock.js"
  },
  moduleDirectories: ["node_modules", "src"],
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
  ]
};