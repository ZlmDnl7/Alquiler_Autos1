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
      testEnvironment: 'node',
      transform: {},
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
      }
    }
  ],
  collectCoverage: true,
  // Permitir que las suites fallen sin detener cobertura en CI
  passWithNoTests: true,
};
