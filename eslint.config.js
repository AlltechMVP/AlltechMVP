import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['error', 'warn'] }],
      // Block irregular whitespace and unicode ellipsis
      'no-irregular-whitespace': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/…/u]",
          message: 'Unicode ellipsis (U+2026) is disallowed. Use normal characters only.',
        },
      ],
    },
  },
];
