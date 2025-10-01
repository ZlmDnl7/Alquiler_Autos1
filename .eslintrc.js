module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true, // Agregar soporte para Jest
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  rules: {
    // Reglas específicas para tests
    'no-undef': 'off', // Desactivar para archivos de test
    'no-unused-vars': 'warn',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/*.spec.js', '**/*.spec.jsx'],
      env: {
        jest: true,
      },
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
