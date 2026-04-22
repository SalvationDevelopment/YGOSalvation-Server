module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  ignorePatterns: [
    'node_modules/',
    'cms/',
    'server/ui/',
    'server/core/scripts/',
    'server/core/database/'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'script'
  },
  rules: {
    // Crockford-style strictness
    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
    'no-eval': 'error',
    'no-with': 'error',
    'no-undef': 'error',
    'no-unused-vars': ['error', { args: 'none', ignoreRestSiblings: true }],
    'no-extend-native': 'error',
    'no-new-func': 'error',
    'no-implied-eval': 'error',
    'no-alert': 'warn',

    // Crockford dislikes ++ and --
    'no-plusplus': ['error', { allowForLoopAfterthoughts: false }],

    // Crockford prefers single quotes
    quotes: ['error', 'single'],

    // Always use semicolons
    semi: ['error', 'always'],

    // Avoid ambiguity
    'no-bitwise': 'error',
    'no-lonely-if': 'error',
    'no-nested-ternary': 'error',
    'no-else-return': ['error', { allowElseIf: false }],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'IfStatement > *.alternate',
        message: 'Unexpected `else`. Invert the condition or return early instead.'
      }
    ],

    // Spacing and clarity
    indent: ['error', 2],
    'space-before-blocks': ['error', 'always'],
    'keyword-spacing': ['error', { before: true, after: true }],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // Optional but stylistically aligned
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error'
  }
};
