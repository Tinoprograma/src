/**
 * Jest Configuration - Sabelo Backend
 *
 * Configuración para testing con Jest
 */

module.exports = {
  // Entorno de testing
  testEnvironment: 'node',

  // Coverage
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/models/index.js',
    '!src/config/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Test patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Setup
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Verbose output
  verbose: true,

  // Force exit
  forceExit: true,

  // Timeout
  testTimeout: 10000
};
