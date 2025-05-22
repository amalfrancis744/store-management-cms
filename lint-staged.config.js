module.exports = {
  // Simple type-check for TS files
  '**/*.ts?(x)': () => 'npm run type-check',
  // Basic lint and format for code files
  '**/*.(ts|tsx|js|jsx)': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
};
