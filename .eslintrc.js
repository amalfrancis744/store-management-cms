module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable all TypeScript related rules
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    
    // Disable other strict rules
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    
    // Basic JavaScript rules only
    'no-console': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'public/',
    '*.config.js',
    '.eslintrc.js'
  ],
}