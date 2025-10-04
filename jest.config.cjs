module.exports = {
  displayName: 'Alquiler Autos Backend',
  
  // Configuración de archivos de test
  testMatch: [
    '**/backend/test.js'
  ],
  
  // Configuración de cobertura optimizada
  collectCoverage: true,
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/node_modules/**',
    '!backend/coverage/**',
    '!backend/test.js',
    '!backend/test_backup.js',
    '!backend/server.js',
    '!backend/**/*.test.js',
    '!backend/**/*.spec.js',
    '!backend/jest.config.js'
  ],
  
  // Directorio de cobertura
  coverageDirectory: 'coverage',
  
  // Reportes de cobertura optimizados para SonarQube
  coverageReporters: [
    'lcov',        // Requerido por SonarQube
    'text',        // Para ver en consola
    'text-summary', // Resumen en consola
    'html',        // Para revisión local
    'json',        // Para herramientas adicionales
    'cobertura'    // Formato alternativo
  ],
  
  // Umbrales de cobertura - Empezar con valores bajos pero realistas
  coverageThreshold: {
    global: {
      branches: 10,     // 10% de ramas cubiertas
      functions: 15,    // 15% de funciones cubiertas
      lines: 20,        // 20% de líneas cubiertas
      statements: 20    // 20% de statements cubiertos
    }
  },
  
  // Configuración del entorno de test
  testEnvironment: 'node',
  
  // Configuración para módulos ES6
  transform: {},
  
  // Configuración del entorno de Node
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },
  
  // Configuración para mejor rendimiento y cobertura
  passWithNoTests: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Configuración de timeouts
  testTimeout: 30000,
  
  // Configuración de setup y teardown
  setupFilesAfterEnv: [],
  
  // Configuración de verbose para mejor debugging
  verbose: true,
  
  // Configuración de coverage para mejor análisis
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/test/',
    '/tests/',
    'server.js'
  ],
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx'],
  
  // Configuración de transformaciones
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],
  
  // Configuración de alias para módulos
  moduleNameMapper: {},
  
  // Configuración de testMatch más específica
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ]
};
