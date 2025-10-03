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
      coverageThreshold: {
        global: {
          branches: 50,
          functions: 60,
          lines: 60,
          statements: 60
        }
      },
      testEnvironment: 'node',
      transform: {},
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons']
      }
    }
  ],
  collectCoverage: true,
  coverageReporters: ['lcov', 'text', 'html', 'json'],
  // Permitir que las suites fallen sin detener cobertura en CI
  passWithNoTests: true,
  // Configuración para mejor cobertura
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
