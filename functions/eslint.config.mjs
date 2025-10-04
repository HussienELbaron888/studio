// functions/eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['dist', 'lib', 'node_modules'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parser: tsParser,
      globals: { ...globals.node },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      // قواعد مفيدة وخفيفة
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
    },
  },
];
