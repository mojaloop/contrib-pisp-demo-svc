module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: [
    '@typescript-eslint',
    'cucumber',
    'prettier',
    'promise',
  ],
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Enforces ES6+ import/export syntax
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // Promise
    'plugin:promise/recommended',
    // Prettier
    'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    indent: 'off',
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    'no-console': 'off',
    quotes: ['error', 'single'],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'never'],
    'cucumber/async-then': 2,
    'cucumber/expression-type': 2,
    'cucumber/no-restricted-tags': [2, 'wip', 'broken', 'foo'],
    'cucumber/no-arrow-functions': 2,
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      // Disable some rules that we abuse in unit tests.
      files: [
        'test /**/*.ts',
      ],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
};
