// Usar CommonJS para que Jest lea la config aunque el proyecto sea type: module
module.exports = {
  // Configuración para monorepo
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/backend/test.js'],
      collectCoverageFrom: [
        'backend/**/*.js',
        '!backend/node_modules/**',
        '!backend/coverage/**',
        '!backend/test.js'
      ],
      coverageDirectory: 'backend/coverage',
      coverageReporters: ['text', 'lcov', 'html']
    },
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/client/src/**/*.test.{js,jsx}'],
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx}',
        '!client/src/node_modules/**',
        '!client/src/coverage/**',
        '!client/src/**/*.test.{js,jsx}',
        '!client/src/**/*.spec.{js,jsx}',
        '!client/src/index.js',
        '!client/src/main.jsx'
      ],
      coverageDirectory: 'client/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js']
    }
  ],
  // Configuración global
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
