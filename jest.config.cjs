module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['**/backend/test.js'],
      collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/node_modules/**',
        '!backend/coverage/**',
        '!backend/test.js'
      ],
      coverageDirectory: 'coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      testEnvironment: 'node',
      transform: {},
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
      }
    }
  ],
  collectCoverage: true,
  passWithNoTests: true,
  forceExit: true,
};
