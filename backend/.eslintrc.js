/**
 * ESLint Configuration - Sabelo Backend
 *
 * Configuración de linting para mantener calidad y consistencia del código
 */

module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Variables
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    'no-undef': 'error',

    // Console
    'no-console': 'off', // Permitido en backend

    // Best Practices
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'prefer-const': 'warn',
    'no-var': 'warn',

    // Async
    'require-await': 'warn',
    'no-return-await': 'warn',

    // Code Style (handled by Prettier mostly)
    'semi': ['error', 'always'],
    'quotes': ['warn', 'single', { allowTemplateLiterals: true }],
    'comma-dangle': ['warn', 'never'],

    // Security
    'no-eval': 'error',
    'no-implied-eval': 'error'
  }
};
