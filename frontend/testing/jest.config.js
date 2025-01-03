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
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js',
  ],
  setupFiles: ['react-app-polyfill/jsdom'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/testing/cssTransform.js',
    '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)': '<rootDir>/testing/fileTransform.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios|camelcase)/',
  ],
  modulePaths: [],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/testing/fileMock.js'
  },
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node',
  ],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  resetMocks: true,
};